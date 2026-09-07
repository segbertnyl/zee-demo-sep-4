import legacyLeftImage from './legacy-left.png'
import legacyLeftImage2x from './legacy-left-2x.png'
import legacyLeftImage3x from './legacy-left-3x.png'
import legacyRightImage from './legacy-right.png'
import legacyRightImage2x from './legacy-right-2x.png'
import legacyRightImage3x from './legacy-right-3x.png'

const Legacy = () => {
  return (
    <div
      className="flex flex-row"
      style={{ gap: 32, paddingLeft: 32, paddingRight: 32, justifyContent: 'center', width: '100%' }}
    >
      <img
        src={legacyLeftImage}
        srcSet={`${legacyLeftImage} 1x, ${legacyLeftImage2x} 2x, ${legacyLeftImage3x} 3x`}
        alt=""
        style={{ width: 443, height: 440, flexShrink: 0 }}
      />
      <img
        src={legacyRightImage}
        srcSet={`${legacyRightImage} 1x, ${legacyRightImage2x} 2x, ${legacyRightImage3x} 3x`}
        alt=""
      />
    </div>
  )
}
export default Legacy
