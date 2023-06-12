import Link from "./link";

import Issue from "../../../issues.png";
import GithubLight from "../../../github.png";
import GithubDark from "../../../github-dark.png";

import Roadmap from "../../../roadmap.png"

interface LinkProps {
    dark: boolean
}

export default function Links(props: LinkProps) {
    const { dark } = props;

    return (
        <div className="my-3 flex min-w-[98%]">
            <Link margin="mr-auto" dark={dark} title="Github Repo" url="https://github.com/ahqsoftwares/tauri-ahq-store" icon={dark ? GithubDark : GithubLight} />
            <Link margin="mx-auto" dark={dark} title="Roadmap" url="https://github.com/users/ahqsoftwares/projects/2" icon={Roadmap} />
            <Link margin="ml-auto" dark={dark} title="Issues" url="https://github.com/ahqsoftwares/tauri-ahq-store/issues" icon={Issue} />
        </div>
    )
}