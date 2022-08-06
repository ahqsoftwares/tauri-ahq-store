export default function init(props: any){
         const {auth} = props;
         return <button className="button" onClick={() => auth.signOut()}>LogOut</button>
}