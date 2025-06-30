import useSWR from 'swr'

export function useEspeCreateList() {
	const { data: dataEspe} = useSWR(`/espe`)
	const { data: dataAssembly} = useSWR(`/assembly`)
    
    let espeList: string[] = []
    espeList = dataEspe.map((item: any)=>{
        return item.codiceMotore
    })
    
    let assemblyList: string[] = []
    assemblyList = dataAssembly.map((item: any)=>{
        return item.codiceMotore
    })
    
    let resultArray: string[] = []
    resultArray = assemblyList.filter(item => !espeList.includes(item))
   
	return { data: resultArray }
}