import onboardingImage from './onboarding.png'

const Onboarding = () => {
  return (
    <div style={{ paddingLeft: 32, paddingRight: 32, display: 'flex', justifyContent: 'center', width: '100%' }}>
      <img src={onboardingImage} alt="" />
    </div>
  )
}
export default Onboarding
