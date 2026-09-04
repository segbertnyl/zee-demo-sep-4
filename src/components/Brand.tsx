import { SectionHeader } from '@/ui/SectionHeader'
import frameImage from './Frame 2134540829.png'

const Brand = () => {
    return (
        <div>
            <SectionHeader
                variant="secondary"
                heading="Based upon what you told me, here is how your personal brand will show up."
                body="On websites here is how your personal brand will be delivered.  Want something to change? Just ask."
            />
            <div className="max-h-[60vh] max-w-[933px] overflow-y-auto overflow-x-hidden mt-4">
                <img src={frameImage} alt="" className="block w-full" />
            </div>
        </div>
    )
}

export default Brand