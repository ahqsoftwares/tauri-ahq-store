import { Auth } from "firebase/auth";
export default function init(props: {auth: Auth, dark: boolean}){
         function darkMode(classes: Array<string>, dark: boolean) {
                  return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
         }
         const {auth} = props;
         
         return (
         <div className={`${darkMode(["menu"], props.dark)}`}>
                  <button className="button mx-auto" onClick={() => auth.signOut()}>LogOut</button>
                  <button className="button mx-auto" onClick={() => auth.currentUser?.delete()}>Delete User</button>
         </div>
         );
}