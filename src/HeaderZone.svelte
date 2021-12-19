<svelte:options tag="header-zone" />

<script>
    import { fly } from "svelte/transition";
    let screenWidth = window.innerWidth;

    let isMenuActive = false;

    let menuLinks = [
        {
            title: "Gopher Ekle",
            path: "/add",
        },
        {
            title: "Beni Oku",
            path: "/readme",
        },
    ];
    const toggleMenu = () => {
        isMenuActive = !isMenuActive;
        if (isMenuActive) {
            document.querySelector("body").style.overflow = "hidden";
        } else {
            document.querySelector("body").style.overflow = "visible";
        }
    };

    const homeButton = () => {
        let dir = location.pathname;
        dir == "/" ? (location.href = "#") : (location.href = "/");
    };
</script>

<link rel="stylesheet" href="/public/global.css" />

<header>
    <div class="topBar">
        <div class="logo" on:click={homeButton} />
        {#if screenWidth > 500}
            <nav>
                {#each menuLinks as link}
                    <a href={link.path}>{link.title}</a>
                {/each}
            </nav>
        {:else}
            <button on:click={toggleMenu} alt="hamburger" class="hamburger" />
        {/if}
    </div>
</header>
{#if isMenuActive}
    <div class="mobileMenu" transition:fly={{ x: 50 }}>
        <button on:click={toggleMenu} class="closeBtn"> X </button>
        <ul>
            {#each menuLinks as link}
                <li>
                    <a href={link.path}>{link.title}</a>
                </li>
            {/each}
        </ul>
    </div>
{/if}

<style>
    header {
        position: fixed;
        top: 0px;
        height: 78px;
        width: 100%;
        background-color: #2c165c;
        border-bottom: 8px solid #411f89;
        z-index: 10;
    }

    header .topBar {
        display: flex;
        position: absolute;
        padding: 0px 10px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        height: 100%;
        color: rgb(241, 239, 239);
        justify-content: space-between;
        align-items: center;
    }
    .topBar .logo {
        height: 50px;
        width: 43px;
        background: url(/public/img/sitelogo.png);
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
        cursor: pointer;
    }

    .topBar nav {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
    }
    nav a {
        position: relative;
        color: rgb(241, 239, 239);
    }

    nav a::after {
        content: "";
        position: absolute;
        bottom: 2px;
        left: 0px;
        border-bottom: 2px solid rgb(241, 239, 239);
        width: 0%;
        transform-origin: center;
        transition: width 0.3s ease-in-out;
    }

    nav a:hover::after {
        width: 100%;
    }

    .mobileMenu {
        position: fixed;
        top: 0px;
        right: 0px;
        width: 100vw;
        height: 100vh;
        background-color: #2c165c;
        color: rgb(241, 239, 239);
        z-index: 12;
        padding: 50px;
    }

    .mobileMenu .closeBtn {
        position: absolute;
        top: 20px;
        right: 20px;
        background: transparent;
        border: 0;
        color: rgb(241, 239, 239);
        font-weight: bold;
        font-size: 20px;
        cursor: pointer;
    }

    .mobileMenu ul li {
        list-style: none;
        margin-bottom: 20px;
    }

    .hamburger {
        display: inline-block;
        background: url("/public/img/hamburger.png");
        width: 50px;
        height: 50px;
        border: 0;
        background-size: 50px;
        background-position: center;
        background-repeat: no-repeat;
        cursor: pointer;
    }
</style>
