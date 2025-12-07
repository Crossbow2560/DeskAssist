import "./Button.css";

function Button({width = 64, height = 64, bg = null}){
    const style ={
        width,
        height,
        backgroundColor: red,
        backgroundImage: bg ? `url(${bg})` : undefined,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        border: none,
        outline: none,
        padding: 0
    };
    return (
        <>
            <button className="button" style={style}></button>
        </>
    )
}

export default Button;