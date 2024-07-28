import "./OnboardingView.css"
import logo from "../../assets/images/logoWithTitle.svg"

function OnboardingView(){
    return (
        <div className="OnboardingView">
           <img src={logo} alt="logo" />
        </div>
    );
}
export default OnboardingView;