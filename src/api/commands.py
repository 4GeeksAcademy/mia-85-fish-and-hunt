
import click
import json
from pathlib import Path
from api.models import db

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are usefull to run cronjobs or tasks outside of the API but sill in integration 
with youy database, for example: Import the price of bitcoin every night as 12am
"""


def setup_commands(app):
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
