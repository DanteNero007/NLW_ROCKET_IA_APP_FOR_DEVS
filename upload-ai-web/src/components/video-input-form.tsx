import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@radix-ui/react-separator";
import { FileVideo, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { getFfmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { api } from "@/lib/axios";

type Status = 'waiting' | 'converting' | 'uploading' | 'generating' | 'success' 

const statusMessage ={
  converting: 'Convewrtendo...',
  generating: 'Transcrevendo...',
  uploading:'Carregando...',
  success: 'Sucesso!',

}

interface VideoInputFormProps{
  onVideoUploaded: (id: string) => void
}


export function VideoInputForm(props: VideoInputFormProps){
  const [ videoFile , setVideoFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('waiting')
  
  const promptInputRef = useRef<HTMLTextAreaElement>(null)


  function handleFileSelected(event:ChangeEvent<HTMLInputElement> ){  
    const { files } = event.currentTarget
     if(!files){
      return
    }
      const selectedFile = files[0]
      setVideoFile(selectedFile)
  }

  async function convertVideoToAudio(video: File){
    console.log('convert started')
    const ffmpeg = await getFfmpeg()
    await ffmpeg.writeFile('input.mp4', await fetchFile(video))

    ffmpeg.on('log', (log)=>{
      console.log(log)
    })

    ffmpeg.on('progress', (progress)=>{
      console.log('Convert progress:' + Math.round(progress.progress * 100))
    })

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3'
    ])

    const data = ffmpeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], {type:'audio/mpeg'})
    const audioFile = new File([audioFileBlob], 'audio.mp3',{
      type:'audio/mpeg',
    })

    console.log('convert finished')

    return audioFile
  }

 async function handleUploadVideo(event: FormEvent<HTMLFormElement>){
      event.preventDefault()
      const prompt = promptInputRef.current?.value

      if(!videoFile){
        return
      }

      //converter o video e audio

      setStatus('waiting')

      const audioFile = await convertVideoToAudio(videoFile)

      //console.log(audioFile, prompt)

      const data = new FormData()
      data.append('file', audioFile)

      setStatus('uploading')


      const response = await api.post('/videos', data)
      
      const videoId = response.data.video.id

      setStatus('generating')

      await api.post(`/videos/${videoId}/transcription`, {
        prompt,
      })

      setStatus('success')

      props.onVideoUploaded(videoId)

      console.log('Finalizaou')


  }

  const previewUrl= useMemo(()=>{
      if(!videoFile){
        return null
      }
      return URL.createObjectURL(videoFile)

  },[videoFile])
 

  return(
    <form onSubmit={handleUploadVideo} action=""className='space-y-6' >
           
            <label htmlFor="video" className=' relative border flex rounded-md 
            aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 
            items-center justify-center text-muted-foreground 
            hover:bg-primary/5'>
              
              { previewUrl ? (
                <video src={previewUrl} controls={false}
                className=" h-full w-full pointer-events-none absolute inset-0" />
              ) :(
                <>
                 <FileVideo className='w-4 h-4 text-primary'/>
                 Selecione um video
                </>
                )}     
            </label>
           
            <input type="file" id='video'  accept='video/mp4' className='sr-only' 
            onChange={handleFileSelected}  />
            <Separator/>
              
              <div className='space-y-2' >

              <Label htmlFor='transcription_prompt' >Prompt de transcrição</Label>
              <Textarea
              disabled ={status != 'waiting'}
              ref={promptInputRef}
              id="transcription_prompt" 
              className='h-20 resize-none leading-relaxed'
              placeholder='inlcua palavaras chaves mencionadas no video separadas por virgula (,)'
              />
              </div>

              <Button disabled={status != 'waiting'} 
              data-success = {status === 'success'}
              type='submit' 
              className='w-full data-[success=true]:bg-emerald-400 ' >
              
              {status === 'waiting' ? (
                <>
                  Carregar video
                  <Upload className='w-4 h-4 ml-2 text-white'/>
                </>
              ):
              
              statusMessage[status]
            }

              </Button>
            <div className='space-y-2' >

            </div>
          </form>

  )
}
