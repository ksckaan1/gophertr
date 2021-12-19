<svelte:options tag="edit-request" />

<script>
    export let gopherid;
    import { onMount } from "svelte";

    import { fade } from "svelte/transition";
    import ShowInfo from "./Info.svelte";

    let gopherData = null;

    let insertCompany = false;
    let jobSelector;
    onMount(() => {
        jobSelector.onchange = (e) => {
            let jobValue = e.target.value;
            if (jobValue == "company") {
                preview.company = "";
                insertCompany = true;
            } else if (jobValue == "freelancer") {
                preview.company = "freelancer";
                insertCompany = false;
            } else {
                preview.company = null;
                insertCompany = false;
            }
        };
    });

    let preview = {social:{}}
    let preferAvatar = "randomGopher";
    let showInfo = false;
    let showError = false;
    let processMessage= "";
    let isGopherLoaded = false;


    //all gopher images
    var gopherPictures = [
		"/public/img/gophers/gopher1.png",
		"/public/img/gophers/gopher2.png",
		"/public/img/gophers/gopher3.png",
		"/public/img/gophers/gopher4.png",
		"/public/img/gophers/gopher5.png",
		"/public/img/gophers/gopher6.png",
	];

    const genRandomGopherPP = () => {
		return gopherPictures[
			Math.floor(Math.random() * gopherPictures.length)
		];
	};

    async function fetchGopher() {
		var req = new XMLHttpRequest();
		req.open("GET", "/api/gopher/"+gopherid, true);
		req.onload = () => {
			if (req.status == 200) {
				preview = JSON.parse(req.responseText)
                isGopherLoaded = true

                if ( preview.profile_img_url){
                    preferAvatar = "twitter";
                }else{
                    preview.profile_img_url = genRandomGopherPP();
                }
			}
		};
		req.send(null);
	}
	fetchGopher();


    const sendGopherData = () => {
        let req = new XMLHttpRequest();
        req.open("POST","/api/gopher/edit-request", true)
        req.setRequestHeader('Content-Type', 'application/json')
        req.onload = ()=>{
            if (req.status == 200) {
                let resp = JSON.parse(req.responseText)
                showInfo = true;
                showError = false;
                processMessage = resp.message
                setTimeout(() => {
                    location.href="/";
                }, 3000);
            }else if(req.status!=200){
                let resp = JSON.parse(req.responseText)
                showInfo = false;
                showError = true;
                processMessage = resp.message
            }
        }
        req.send(JSON.stringify({
            "gopher": preview,
            "avatar_method": preferAvatar
        }))
    };

    $: isSubmitButtonDisabled = !preview.name || (preferAvatar == "twitter" && !preview.social.twitter)

    const goHome = () => {
        location.href = "/";
    };
    const deleteGopher = (id)=>{
        let req = new XMLHttpRequest();
        req.open("GET","/api/gopher/delete-request/"+id, true)
        req.onload = ()=>{
            if (req.status == 200) {
                let resp = JSON.parse(req.responseText)
                showInfo = true;
                showError = false;
                processMessage = resp.message
                setTimeout(() => {
                    location.href="/";
                }, 3000);
            }else if(req.status!=200){
                let resp = JSON.parse(req.responseText)
                showInfo = false;
                showError = true;
                processMessage = resp.message
            }
        }
        req.send(null)
    }
    
</script>

<link rel="stylesheet" href="/public/global.css" />
<show-info close={true}>
    <h3>Lütfen Okuyun!</h3>
    <p>
        &rightarrow; Gopher kartı için profil fotoğrafı, Twitter profilinden
        çekilir. Profil fotoğrafı için, Twitter kullanıcı adını eklemeyi
        unutmayın...
    </p>
    <p>
        &rightarrow; Buraya girmiş olunan bilgiler herkes tarafından
        görülebilecektir.
    </p>
    <p>
        <b>Gopher kartınının görüntülenmesi için yönetici onayı gereklidir.</b>
    </p>
</show-info>
{#if isGopherLoaded}
<div class="gopherEditor">
    <div class="editor">
        <section>
            <div class="title">Temel Bilgiler</div>
            <div class="column">
                <b>Ad ve Soyad:</b>
                <input
                    type="text"
                    bind:value={preview.name}
                    placeholder="John Doe"
                />
            </div>
            <div class="column">
                <b>Çalışma Durumu:</b>
                <select bind:this={jobSelector}>
                    <option value="freelancer">Serbest Çalışıyor</option>
                    <option value="company">Şirkette Çalışıyor</option>
                    <option value="" selected>Çalışmıyor</option>
                </select>
                {#if insertCompany}
                    <input
                        type="text"
                        bind:value={preview.company}
                        placeholder="Şirket İsmi"
                        transition:fade
                    />
                {/if}
            </div>
            <div class="column">
                <b>Arayış Durumu:</b>
                <select bind:value={preview.job_status} place>
                    <option value="looking">İş Arıyor</option>
                    <option value="hiring">Çalışan Arıyor</option>
                    <option value="" selected>Belirtilmemiş</option>
                </select>
            </div>
            <div class="descolumn">
                <b>Açıklama:</b>
                <textarea
                    bind:value={preview.description}
                    placeholder="Buraya açıklama girebilirsiniz..."
                />
            </div>
        </section>

        <section>
            <div class="title">İletişim</div>
            <div class="column">
                <b><i class="github" /> GitHub:</b>
                <input
                    type="text"
                    placeholder="kullanıcı adı"
                    bind:value={preview.social.github}
                />
            </div>
            <div class="column">
                <b><i class="gitlab" /> GitLab:</b>
                <input
                    type="text"
                    placeholder="kullanıcı adı"
                    bind:value={preview.social.gitlab}
                />
            </div>
            <div class="column">
                <b><i class="twitter" /> Twitter:</b>
                <input
                    type="text"
                    placeholder="kullanıcı adı"
                    bind:value={preview.social.twitter}
                />
            </div>
            <div class="column">
                <b><i class="facebook" /> Facebook:</b>
                <input
                    type="text"
                    placeholder="kullanıcı adı"
                    bind:value={preview.social.facebook}
                />
            </div>
            <div class="column">
                <b><i class="youtube" /> YouTube:</b>
                <input
                    type="text"
                    placeholder="/u/kanallinki"
                    bind:value={preview.social.youtube}
                />
            </div>
            <div class="column">
                <b><i class="instagram" /> Instagram:</b>
                <input
                    type="text"
                    placeholder="kullanıcı adı"
                    bind:value={preview.social.instagram}
                />
            </div>
            <div class="column">
                <b><i class="telegram" /> Telegram:</b>
                <input
                    type="text"
                    placeholder="kullanıcı adı"
                    bind:value={preview.social.telegram}
                />
            </div>
            <div class="column">
                <b><i class="linkedin" /> LinkedIn:</b>
                <input
                    type="text"
                    placeholder="kullanıcı adı"
                    bind:value={preview.social.linkedin}
                />
            </div>
            <div class="column">
                <b><i class="reddit" /> Reddit:</b>
                <input
                    type="text"
                    placeholder="kullanıcı adı"
                    bind:value={preview.social.reddit}
                />
            </div>
            <div class="column">
                <b><i class="kommunity" /> Kommunity:</b>
                <input
                    type="text"
                    placeholder="kullanıcı adı"
                    bind:value={preview.social.kommunity}
                />
            </div>
            <div class="column">
                <b><i class="email" /> E-Mail:</b>
                <input
                    type="text"
                    placeholder="me@example.com"
                    bind:value={preview.social.email}
                />
            </div>
            <div class="column">
                <b><i class="website" /> Website:</b>
                <input
                    type="text"
                    placeholder="https://example.com"
                    bind:value={preview.social.website}
                />
            </div>
        </section>
        <section>
            <div class="title">Gopher Avatar</div>
            <p>Profil resmini kullanma tercihini yapın</p>
            <p>
                <input bind:group={preferAvatar} type="radio" name="from" id="randomGopher" value="randomGopher">
                <label for="randomGopher">Rastgele Gopher resmi kullan</label>
            </p>
            <p>
                <input bind:group={preferAvatar} type="radio" name="from" id="fetchfromtw" value="twitter">
                <label for="fetchfromtw">Twitter profil resmini kullan</label>
            </p>
        </section>
    </div>
    <!-- Gopher Card Preview Zone -->
    <section class="preview">
        <div class="previewSticky">
            <div class="title">Ön izleme</div>
            <div class="gopher" cardType={preview.job_status} transition:fade>
                <div class="leftSide">
                    <div class="companySide">
                        {#if preview.company == "freelancer"}
                            Serbest Çalışıyor
                        {:else}
                            {preview.company || "Çalışmıyor"}
                        {/if}
                    </div>
                    <img
                        class="avatar"
                        src={preview.profile_img_url}
                        alt="ppimage"
                    />
                    <div class="jobStatusSide">
                        {#if preview.job_status == "looking"}İş Arıyor{:else if preview.job_status == "hiring"}Çalışan
                            Arıyor{:else if preview.company}Çalışıyor{/if}
                    </div>
                </div>
                <div class="rightSide">
                    <div class="topSide">
                        <div class="name">{preview.name || "John Doe"}</div>
                        <div class="description">
                            {preview.description || "Açıklama Bulunmuyor"}
                        </div>
                    </div>
                    <div class="socialLinks">
                        {#if preview.social.github}<a
                                href="https://github.com/{preview.social
                                    .github}"
                                target="_blank"><i class="github" /></a
                            >{/if}
                        {#if preview.social.gitlab}<a
                                href="https://gitlab.com/{preview.social
                                    .gitlab}"
                                target="_blank"><i class="gitlab" /></a
                            >{/if}
                        {#if preview.social.twitter}<a
                                href="https://twitter.com/{preview.social
                                    .twitter}"
                                target="_blank"><i class="twitter" /></a
                            >{/if}
                        {#if preview.social.facebook}<a
                                href="https://facebook.com/{preview.social
                                    .facebook}"
                                target="_blank"><i class="facebook" /></a
                            >{/if}
                        {#if preview.social.youtube}<a
                                href="https://youtube.com/{preview.social
                                    .youtube}"
                                target="_blank"><i class="youtube" /></a
                            >{/if}
                        {#if preview.social.instagram}<a
                                href="https://instagram.com/{preview.social
                                    .instagram}"
                                target="_blank"><i class="instagram" /></a
                            >{/if}
                        {#if preview.social.telegram}<a
                                href="https://t.me/{preview.social.telegram}"
                                target="_blank"><i class="telegram" /></a
                            >{/if}
                        {#if preview.social.linkedin}<a
                                href="https://linkedin.com/in/{preview.social
                                    .linkedin}"
                                target="_blank"><i class="linkedin" /></a
                            >{/if}
                        {#if preview.social.reddit}<a
                                href="https://reddit.com/u/{preview.social
                                    .reddit}"
                                target="_blank"><i class="reddit" /></a
                            >{/if}
                        {#if preview.social.kommunity}<a
                                href="https://kommunity.com/@{preview.social
                                    .kommunity}"
                                target="_blank"><i class="kommunity" /></a
                            >{/if}
                        {#if preview.social.email}<a
                                href={"mailto:" + preview.social.email}
                                target="_blank"><i class="email" /></a
                            >{/if}
                        {#if preview.social.website}<a
                                href={preview.social.website}
                                target="_blank"><i class="website" /></a
                            >{/if}
                    </div>
                </div>
            </div>
            <div class="actionButtons">
                <button on:click={goHome} class="cancel">
                    &leftarrow; İptal
                </button>
                <button  on:click={deleteGopher(preview.id)} class="delete">Silme İsteğinde Bulun</button>
                <button on:click={sendGopherData} class="confirm" disabled={isSubmitButtonDisabled}>
                    Düzenleme İsteğinde Bulun
                </button>
            </div>
            {#if showInfo}
            <div class="processInfo">
                {processMessage}
            </div>
            {/if}
            {#if showError}
            <div class="error">
                {processMessage}
            </div>
            {/if}
            {#if preview.name == "" || preview.name==undefined}
            <div class="error">
                Lütfen isim alanını doldurunuz!
            </div>
            {/if}
            {#if preferAvatar=="twitter" && (preview.social.twitter == undefined || preview.social.twitter == "")}
            <div class="error">
                Lütfen Twitter kullanıcı adını giriniz!
            </div>
            {/if}
        </div>
    </section>
</div>
{:else}
<div class="loader">
    <img src="/public/img/loading.gif" alt="gopher">
    <div class="loadingText">
        Gopher hazırlanıyor...
    </div>
</div>
{/if}

<style>
    @keyframes blink{
        0%{
            opacity: .3;
        }
        50%{
            opacity: 1;
        }
        100%{
            opacity: .3;
        }
    }
    .loader{
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 50px 0px;
        gap: 30px;
    }
    .loader img{
        width: 100px;
    }
    .loadingText{
        color: gray;
        animation-name: blink;
        animation-duration: .5s;
        animation-iteration-count: infinite;
    }
    .processInfo{
        color: white;
        background-color: green;
        padding: 10px;
        margin-top: 20px;
        box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.3);
        border-radius: 2px;
    }
    .error{
        color: white;
        background-color: darkred;
        padding: 10px;
        border-radius: 2px;
        box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.3);
        margin-top: 20px;
    }
    .gopherEditor {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
    }
    .editor {
        position: relative;
        min-width: 300px;
        flex: 1;
        padding: 20px;
        background-color: rgb(245, 245, 245);
        box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.3);
        color: rgb(73, 73, 73);
        border-radius: 2px;
    }
    .editor .title {
        font-size: 25px;
        font-weight: bold;
        color: rgb(20, 20, 20);
    }

    .column {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
    }
    .column b {
        flex: 1;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    b > i {
        filter: invert(1);
        margin-right: 10px;
    }
    .descolumn {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .descolumn textarea {
        color: rgb(73, 73, 73);
        border-radius: 2px;
        border: none;
        padding: 10px;
        font-size: 16px;
        width: 100%;
        height: 100px;
        resize: none;
        margin-bottom: 30px;
        background-color: rgb(240, 240, 240);
        box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.3);
    }
    textarea:focus {
        outline-color: #411f89;
    }
    textarea::placeholder {
        color: rgb(104, 102, 102);
    }

    .editor input[type="text"] {
        padding: 10px 20px;
        font-size: 16px;
        border-radius: 2px;
        border: 0px;
        background-color: rgb(240, 240, 240);
        color: rgb(73, 73, 73);
        width: 200px;
        margin-bottom: 10px;
        float: right;
        flex: 1;
        box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.3);
    }
    input[type="text"]::placeholder {
        color: rgb(165, 165, 165);
    }

    .editor input[type="text"]:focus {
        outline-color: #411f89;
    }
    .editor select {
        font-size: 16px;
        padding: 10px 20px;
        border-radius: 2px;
        border: 0px;
        background-color: rgb(240, 240, 240);
        color: rgb(73, 73, 73);
        width: 200px;
        margin-bottom: 10px;
        float: right;
        flex: 1;
        box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.3);
    }
    .editor select:focus {
        outline-color: #411f89;
    }

    .preview {
        position: relative;
        width: 100%;
        max-width: 400px;
        height: 1000px;
    }

    .previewSticky {
        position: sticky;
        top: 90px;
    }
    .preview .title {
        font-size: 25px;
        font-weight: bold;
        color: rgb(26, 26, 26);
    }
    .actionButtons {
        width: 100%;
        display: flex;
        margin-top: 30px;
        gap: 10px;
    }
    .cancel {
        flex: 1;
        background-color: transparent;
        color: rgb(124, 123, 123);
        font-size: 16px;
        border: 0;
        padding: 10px 20px;
        cursor: pointer;
        opacity: 0.8;
    }
    .cancel:hover {
        opacity: 1;
    }
    .delete{
        flex: 1;
        background-color: darkred;
        color: white;
        font-size: 16px;
        padding: 10px 20px;
        border: 0px;
        cursor: pointer;
        border-radius: 2px;
        box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.3);
        transition: background-color 0.5s;
    }
    .delete:hover {
        background-color: rgb(173, 9, 9);
    }
    .confirm {
        flex: 1;
        background-color: #53309e;
        color: white;
        font-size: 16px;
        padding: 10px 20px;
        border: 0px;
        cursor: pointer;
        border-radius: 2px;
        box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.3);
        transition: background-color 0.5s;
    }
    .confirm:disabled{
        cursor:not-allowed;
        opacity: .5;
    }
    .confirm:hover {
        background-color: #411f89;
    }

    /* Contact icons */

    i {
        background-size: 24px;
        background-repeat: no-repeat;
        width: 24px;
        height: 24px;
        display: inline-block;
        opacity: 0.7;
        transition: opacity 0.3s;
    }
    i:hover {
        opacity: 1;
    }
    .github {
        background: url("/public/img/icons/github.png");
    }
    .gitlab {
        background: url("/public/img/icons/gitlab.png");
    }
    .twitter {
        background: url("/public/img/icons/twitter.png");
    }
    .facebook {
        background: url("/public/img/icons/facebook.png");
    }
    .youtube {
        background: url("/public/img/icons/youtube.png");
    }
    .telegram {
        background: url("/public/img/icons/telegram.png");
    }
    .linkedin {
        background: url("/public/img/icons/linkedin.png");
    }
    .reddit {
        background: url("/public/img/icons/reddit.png");
    }
    .instagram {
        background: url("/public/img/icons/instagram.png");
    }
    .email {
        background: url("/public/img/icons/email.png");
    }
    .website {
        background: url("/public/img/icons/website.png");
    }
    .kommunity {
        background: url("/public/img/icons/kommunity.png");
    }
</style>
