export const initialStore = (initialValues) => {
  return {
    API_BASE_URL: import.meta.env.VITE_BACKEND_URL,
    token: undefined,
    message: null,
    ...initialValues,
  };
};
export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "authenticate":
      localStorage.setItem("token", action.payload);
      return {
        ...store,
        token: action.payload,
      };
    case "logout":
      localStorage.clear(); //remove all site storage
      return {
        ...store,
        token: undefined,
      };
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };
    default:
      throw Error("Unknown action.");
  }
}
