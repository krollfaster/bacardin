import { AIInputContainer } from '@/components/features/AIInput'

const App = () => {
    return (
        <div className="relative flex justify-center items-center bg-[#16130F] w-full h-screen">
            <AIInputContainer
                placeholder="Write your massage"
                onSubmit={(value) => console.log('Submitted:', value)}
            />
        </div>
    )
}

export default App
