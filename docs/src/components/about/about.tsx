import "./index.css";

interface AboutProps {
         dark: boolean;
}

export default function About(props: AboutProps) {
         const {
                  dark
         } = props;

         return (<div className={`${dark ? "menu-d" : "menu"}`}></div>);
}