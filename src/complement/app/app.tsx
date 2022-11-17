interface AppProps {
         appId: string
}

export default function App({
         appId
}: AppProps) {
         console.log(appId);
         return <div className="w-[100%] h-[100%]">

         </div>
}