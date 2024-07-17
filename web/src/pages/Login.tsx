import type { NewUser } from "server/models/user";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default () => {
  const navigate = useNavigate();

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.target as HTMLFormElement);
          const data = Object.fromEntries(form.entries());
          api.auth.login(data as NewUser).then(() => {
            navigate("/");
          });
        }}
      >
        <input type="text" name="username"></input>
        <input type="password" name="password"></input>
        <input type="submit" value="" />
      </form>
    </div>
  );
};
