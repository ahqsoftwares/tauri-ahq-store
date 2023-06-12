interface Link {
    dark: boolean 
    margin: string
    title: string
    icon: string
    url: string
}

export default function Link(props: Link) {
    const { dark, margin, title, icon, url } = props;
    
    return (
        <div className={`link ${margin} ${dark ? "link-dark" : ""}`} onClick={() => {
            window.open(url, "_blank");
        }}>
            <img
                src={icon}
            />
            <h1>{title}</h1>
        </div>
    )
}