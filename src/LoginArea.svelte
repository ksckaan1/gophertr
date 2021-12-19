<svelte:options tag="login-area"/>
<script>
    import {fade} from "svelte/transition";
let userid;
let userpass;

let warning;
let showSuccess= false;
let showError= false;

$: isButtonDisable = userid && userpass ? false : true

const sendUserData = ()=>{
    showSuccess = false;
    showError = false;
    let req = new XMLHttpRequest();
    req.open("POST","/login",true)
    req.setRequestHeader('Content-Type', 'application/json')
    req.onload = ()=>{
        if (req.status ==200){
            let data = JSON.parse(req.responseText)
            warning = data.message
            showSuccess = true
            setTimeout(() => {
                location.href="/"
            }, 2000);

        }else{
            let data = JSON.parse(req.responseText)
            warning = data.message
            showError = true
        }
    }
    req.send(JSON.stringify({
        "id": userid,
        "pass": userpass
    }))
}

</script>
<div class="page">
    <div class="loginArea">
        <img src="/public/img/sitelogo.png" alt="logo">
        <input bind:value={userid} type="text" placeholder="Kullanıcı Adı"/>
        <input bind:value={userpass} type="password" placeholder="Şifre"/>
        <button on:click={sendUserData} disabled={isButtonDisable}>Giriş Yap</button>
        {#if warning && showSuccess}
        <div in:fade class="success">
            {warning}
        </div>
        {:else if showError}
        <div in:fade class="error">
            {warning}
        </div>
        {/if}
    </div>
</div>
<style>
.page{
    background: url("/public/img/loginbg.png");
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loginArea{
    box-sizing: border-box;
    border-radius: 2px;
    box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 300px;
    height: 100%;
    max-height: 400px;
    background-color: #271647;
    color: white;
    display: flex;
    flex-direction: column;
    padding: 20px;
    justify-content: center;
    align-items: center;
    gap: 20px;
}
.loginArea img{
    height: 50px;
    width: 43px;
}
.loginArea input{
    padding: 10px 20px;
    font-size: 18px;
    border-radius: 2px;
    border: 0px;
}
.loginArea button{
    padding: 10px 20px;
    background-color: #411F89;
    color: white;
    border-radius: 2px;
    border: 0px;
    transition: background-color .5s;
    cursor: pointer;
}

.loginArea button:disabled{
    opacity: .5;
    cursor: not-allowed;
}
.loginArea button:hover{
    background-color: #542aad;
}

.success{
    background-color: green;
    color: white;
    padding: 10px;
    border-radius: 2px;
}
.error{
    background-color: darkred;
    color: white;
    padding: 10px;
    border-radius: 2px;
}
</style>