import './index.css'
import { Button } from './components/ui/button'
import { Separator } from './components/ui/separator'
import  { Github, Wand2}  from 'lucide-react'
import { Textarea } from './components/ui/textarea'
import { Label } from './components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Slider } from './components/ui/slider'
import { VideoInputForm } from './components/video-input-form'
import { PromptSelect } from './components/prompt-select'
import { useState } from 'react'
import { useCompletion} from 'ai/react'

export function App() {

  const [temperature, setTemperature] = useState(0.5)
  const [videoId, setVideoId] = useState<string | null>(null)

//  function handlePromptSelect(template: string){
  //    console.log(template)
  //}

  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading,
  } = useCompletion({
    api: 'http://localhost:3333/ai/complete',
    body:{
      videoId,
      temperature,
    },
    headers:{
      'Content-type': "application/json"
    },
  })

  
  return (
    <div className=' flex flex-col min-h-screen' >
                
      <div className=' bg-black px-6 py-3 flex items-center 
      justify-between border-b' >
        <h1 className='text-xl font-bold' >Upload.ai</h1>
        <button className='' >TEMA CEGUEIRA DA MORTE</button>

        <div className='flex items-center gap-3' >
          <span className='text-sm text-muted-foreground' >Desenvolvido com amor no NLW da Rocketseat</span>
          
          <Separator orientation='vertical' className='h-6'/>

          <Button variant="outline" className='hover:text-rose-500' > 
          <Github className='w-4 h-4 mr-2 hover:text-rose-600 rounded-full' />
          Github 
          </Button>
        </div>
      </div>

      <main className='flex-1 p-6 flex gap-6' >
        <div className='flex flex-col flex-1 gap-4' >
          <div className='grid grid-rows-2 gap-4 flex-1' >
            <Textarea 
            placeholder='Inclua o prompt para a IA ' 
            className='resize-none p-5 leading-relaxed '
            value={input}
            onChange={handleInputChange}
            />
            <Textarea 
            placeholder='Resultado gerado para a IA' readOnly 
            className='resize-none p-5 leading-relaxed '
            value={completion}
            />
            </div>
          <p className='text-sm text-muted-foreground'  >
            Lembresse você pode utilizar a variavel 
            <code className='text-violet-400' >
              {'{transcription}'}
            </code> 
            no seu prompt para adicionar conteurdo para trascrição doseu video selecionado</p>
        </div>
        
        <aside className='w-80 space-y-6 ' >
          
          <VideoInputForm onVideoUploaded={setVideoId} />

          <Separator />

          <form action="" onSubmit={handleSubmit} className='space-y-6'>
            
          <div className='space-y-2' >
              <Label className='border-white'></Label>
              <PromptSelect onPromptSelect={setInput} />            
            </div>


            <div className='space-y-2' >
              <Label className='border-white' ></Label>
              <Select defaultValue='gpt 3.5' >
                <SelectTrigger>
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='GPT 3.5' >GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>
              <span className='block text-xs text-muted-foreground'>Você podera customizar esta opção em breve</span>
            </div>
            <Separator/>
            <div className='space-y-4' >

              <Label>Temperatura</Label>
                        <Slider min={0} max={1} step={0.1} value={[temperature]}
                        onValueChange={value => setTemperature(value[0])}
                        />
              <span className='block text-xs text-muted-foreground leading-relaxed'>
              Valores mais altos tendem a deixar o resultado mais criativo e com possiveis erros.
              </span>
            </div>
            <Separator/>
            <Button type='submit' className='w-full'  disabled={isLoading}>
              Executar
              <Wand2 className='w-4 h-4 ml-2' />
            </Button>

          </form>

        </aside>
      </main>

    </div>

  )
}

