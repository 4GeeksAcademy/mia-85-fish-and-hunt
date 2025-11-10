
import click
import json
from pathlib import Path
from api.models import db, User, Fish

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are usefull to run cronjobs or tasks outside of the API but sill in integration 
with youy database, for example: Import the price of bitcoin every night as 12am
"""


def setup_commands(app):
    """ 
    This is an example command "insert-test-users" that you can run from the command line
    by typing: $ flask insert-test-users 5
    Note: 5 is the number of users to add
    """
    @app.cli.command("insert-test-users")  # name of our command
    @click.argument("count")  # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        for x in range(1, int(count) + 1):
            user = User()
            user.email = "test_user" + str(x) + "@test.com"
            user.password = "123456"
            user.is_active = True
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

    @app.cli.command("insert-test-data")
    def insert_test_data():
        pass

    @app.cli.command("seed-fish")
    @click.option("--file", default="src/data/all-fish-species.json", help="Path to fish JSON file")
    @click.option("--clear", is_flag=True, default=False, help="If set, clears existing Fish rows before seeding")
    def seed_fish(file, clear):
        """Seed the Fish table from a JSON file.

        By default this will skip fish that already exist (matched by name).
        Use --clear to delete all existing Fish rows first.
        """
        data_path = Path(file)
        if not data_path.exists():
            print(f"File not found: {data_path}")
            return

        if clear:
            print("Clearing existing Fish rows...")
            try:
                num = db.session.query(Fish).delete()
                db.session.commit()
                print(f"Deleted {num} Fish rows")
            except Exception as e:
                db.session.rollback()
                print("Failed to clear Fish rows:", e)
                return

        print(f"Loading fish from {data_path}")
        with data_path.open("r", encoding="utf-8") as f:
            items = json.load(f)

        created = 0
        skipped = 0
        skipped_no_name = 0
        truncated = 0
        to_add = []

        # model column limits (keep in sync with models.py)
        NAME_MAX = 100
        LINK_MAX = 255

        for item in items:
            name = item.get("name")
            wiki_link = item.get("url")
            # try to pick a sensible image: prefer 2x then 1.5x then any
            image_link = None
            img_src_set = item.get("img_src_set") or {}
            if isinstance(img_src_set, dict):
                image_link = img_src_set.get("2x") or img_src_set.get("1.5x")
                if not image_link:
                    # fallback to first available
                    vals = list(img_src_set.values())
                    if vals:
                        image_link = vals[0]

            # skip items without a name
            if not name:
                skipped_no_name += 1
                continue

            # sanitize / truncate to model limits
            if isinstance(name, str) and len(name) > NAME_MAX:
                name = name[:NAME_MAX]
                truncated += 1
            if isinstance(wiki_link, str) and len(wiki_link) > LINK_MAX:
                wiki_link = wiki_link[:LINK_MAX]
                truncated += 1
            if isinstance(image_link, str) and len(image_link) > LINK_MAX:
                image_link = image_link[:LINK_MAX]
                truncated += 1

            # skip if a Fish with same name exists
            if db.session.query(Fish).filter_by(name=name).first():
                skipped += 1
                continue

            fish = Fish(name=name, wiki_link=wiki_link, image_link=image_link)
            to_add.append(fish)

            # batch commit every 500 items to avoid large transactions
            if len(to_add) >= 500:
                try:
                    db.session.add_all(to_add)
                    db.session.commit()
                    created += len(to_add)
                except Exception as e:
                    db.session.rollback()
                    print("Batch commit failed:", e)
                    # fallback: try inserting one by one to isolate problem item
                    for one in to_add:
                        try:
                            db.session.add(one)
                            db.session.commit()
                            created += 1
                        except Exception as e2:
                            db.session.rollback()
                            print("Skipping item due to error:",
                                  getattr(one, 'name', None), e2)
                            skipped += 1
                to_add = []

        if to_add:
            try:
                db.session.add_all(to_add)
                db.session.commit()
                created += len(to_add)
            except Exception as e:
                db.session.rollback()
                print("Final batch commit failed:", e)
                for one in to_add:
                    try:
                        db.session.add(one)
                        db.session.commit()
                        created += 1
                    except Exception as e2:
                        db.session.rollback()
                        print("Skipping item due to error:",
                              getattr(one, 'name', None), e2)
                        skipped += 1

        print(
            f"Seeding complete. Created: {created}, Skipped (existing): {skipped}, Skipped (no name): {skipped_no_name}, Truncated fields: {truncated}")

    @app.cli.command("seed-cities")
    @click.option("--file", default="src/data/usa-cities-geo.json", help="Path to cities JSON file")
    @click.option("--clear", is_flag=True, default=False, help="If set, clears existing Location rows before seeding")
    def seed_cities(file, clear):
        """Seed the Location table from a cities JSON file.

        The JSON should be an array of objects with at least: name, position {lat,lng}, type, directions.
        By default this will skip locations that already exist (matched by name).
        Use --clear to delete all existing Location rows first.
        """
        data_path = Path(file)
        if not data_path.exists():
            print(f"File not found: {data_path}")
            return

        # import Location model here to avoid circular import at module load
        from api.models import Location

        if clear:
            print("Clearing existing Location rows...")
            try:
                num = db.session.query(Location).delete()
                db.session.commit()
                print(f"Deleted {num} Location rows")
            except Exception as e:
                db.session.rollback()
                print("Failed to clear Location rows:", e)
                return

        print(f"Loading cities from {data_path}")
        with data_path.open("r", encoding="utf-8") as f:
            items = json.load(f)

        created = 0
        skipped = 0
        skipped_no_name = 0
        invalid_position = 0
        to_add = []

        for item in items:
            name = item.get("name")
            position = item.get("position") or {}
            directions = item.get("directions")
            type_ = item.get("type") or "fishing"

            # required checks
            if not name:
                skipped_no_name += 1
                continue

            try:
                lat = float(position.get("lat"))
                lng = float(position.get("lng"))
            except Exception:
                invalid_position += 1
                continue

            # normalize type
            if type_ not in {"fishing", "hunting"}:
                type_ = "fishing"

            # skip if a Location with same name exists
            if db.session.query(Location).filter_by(name=name).first():
                skipped += 1
                continue

            loc = Location(
                name=name.strip(),
                type=type_,
                position={"lat": lat, "lng": lng},
                directions=(directions or None),
            )
            to_add.append(loc)

            # batch commit every 500 items
            if len(to_add) >= 500:
                try:
                    db.session.add_all(to_add)
                    db.session.commit()
                    created += len(to_add)
                except Exception as e:
                    db.session.rollback()
                    print("Batch commit failed:", e)
                    for one in to_add:
                        try:
                            db.session.add(one)
                            db.session.commit()
                            created += 1
                        except Exception as e2:
                            db.session.rollback()
                            print("Skipping item due to error:",
                                  getattr(one, 'name', None), e2)
                            skipped += 1
                to_add = []

        if to_add:
            try:
                db.session.add_all(to_add)
                db.session.commit()
                created += len(to_add)
            except Exception as e:
                db.session.rollback()
                print("Final batch commit failed:", e)
                for one in to_add:
                    try:
                        db.session.add(one)
                        db.session.commit()
                        created += 1
                    except Exception as e2:
                        db.session.rollback()
                        print("Skipping item due to error:",
                              getattr(one, 'name', None), e2)
                        skipped += 1

        print(
            f"Seeding complete. Created: {created}, Skipped (existing): {skipped}, Skipped (no name): {skipped_no_name}, Invalid positions: {invalid_position}")
