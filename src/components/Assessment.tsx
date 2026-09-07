import assessmentImage from './assessment.png'
import assessmentImage2x from './assessment-2x.png'
import assessmentImage3x from './assessment-3x.png'

const Assessment = () => {
  return (
    <div style={{ paddingLeft: 32, paddingRight: 32, display: 'flex', justifyContent: 'center', width: '100%' }}>
      <img
        src={assessmentImage}
        srcSet={`${assessmentImage} 1x, ${assessmentImage2x} 2x, ${assessmentImage3x} 3x`}
        alt=""
      />
    </div>
  )
}
export default Assessment
