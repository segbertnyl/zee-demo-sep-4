import legacyLeftImage from './legacy-left.png'
import legacyRightImage from './legacy-right.png'

const Legacy = () => {
  return (
    <div
      className="flex flex-row"
      style={{ gap: 32, paddingLeft: 32, paddingRight: 32, justifyContent: 'center', width: '100%' }}
    >
      <img src={legacyLeftImage} alt="" style={{ width: 443, height: 440, flexShrink: 0 }} />
      <img src={legacyRightImage} alt="" />
    </div>
  )
}
export default Legacy
