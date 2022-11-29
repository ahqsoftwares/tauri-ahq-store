import { BiArrowBack } from "react-icons/bi";

export default function Submit(
         props: {
                  toggle: Function,
                  dark: boolean
         }
) {
         const {
                  dark
         } = props;

         return (
                  <div className="w-[100%] h-[100%]" style={{"overflowY": "hidden"}}>
                           <button className={`p-1 ${props.dark ? "text-slate-200 hover:bg-gray-600" : "text-slate-800 hover:bg-gray-100"} rounded-md`} style={{"transition": "all 125ms linear"}} onClick={() => props.toggle()}>
                                    <BiArrowBack size="1.5em"/>
                           </button>
                           <form className="w-[100%] min-h-auto h-[100%] pb-8 flex flex-col items-center space-y-3" style={{"overflowY": "scroll"}}>
                                    <input 
                                             className={`style-input ${dark ? "style-input-d" : ""}`}
                                             placeholder="App Name"
                                             minLength={3}
                                             maxLength={30}
                                    ></input>
                                    <textarea 
                                             className={`style-input ${dark ? "style-input-d" : ""}`}
                                             placeholder="App Description"
                                             rows={10}
                                             minLength={100}
                                             maxLength={300}
                                             style={{
                                                      "resize": "none",
                                                      "minHeight": "263px"
                                             }}
                                    ></textarea>
                           </form>
                  </div>
         )
}