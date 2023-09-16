import { api } from "@/lib/axios";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { useEffect, useState } from "react";

interface PromptType{
  id: string
  title: string
  template: string
}

interface onPromptSelectProps {
  onPromptSelect: (template: string) => void
}

export function PromptSelect(props: onPromptSelectProps){
  
  const [prompts, setPrompts] = useState<PromptType[] | null>(null)
  
  useEffect(() =>{
        api.get('/prompts').then((response)=>{
            console.log(response.data)
                setPrompts(response.data)
        })
  },[])

  function handlePromptSelected(promptId: string){
      const selectedPrompt = prompts?.find(prompt => prompt.id === promptId)

      if(!selectedPrompt){
        return
      }

     return props.onPromptSelect(selectedPrompt.template)
  }
  
  return(
      <Select  onValueChange={handlePromptSelected} >
                <SelectTrigger className=" " >
                  <SelectValue placeholder="Selecione um prompt"/>
                </SelectTrigger>
                <SelectContent className="bg-black border-solid border-2" >
                    {prompts?.map(prompt =>{

                      return(
                        <SelectItem className=" hover:bg-rose-300" 
                        key={prompt.id} value={prompt.title} defaultValue={prompt.title}>
                            {prompt.title}
                        </SelectItem>
                      )
                    }
                    )}                  
                </SelectContent>
              </Select>
      )

}


