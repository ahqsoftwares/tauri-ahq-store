export default function MobileIndex(
         {dark}: {dark: boolean}
) {
         console.log(dark)
         return (
                  <div className="absolute h-screen w-screen flex justify-center items-center text-center">
                           <div className={`w-[40rem] h-[28rem] ${dark ? "bg-gray-900" : "bg-gray-300"} rounded-xl shadow-xl`}>
                                    
                           </div>
                  </div>
         )
}