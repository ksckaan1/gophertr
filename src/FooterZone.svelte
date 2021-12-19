<svelte:options tag="footer-zone"/>
<script>

</script>
<footer>
    <span>Created by <a href="https://kaanksc.com" target="_blank">&copy;Kaan Kuscu</a> with <a href="https://gofiber.io" target="_blank">Gofiber</a> and <a href="https://svelte.dev" target="_blank">Svelte.js</a>.</span>
 </footer>

<style>
    footer{
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 10px;
        width: 90%;
        height: 100px;
        color: rgb(95, 94, 94);
        margin: auto;
    }
    footer a{
        text-decoration: none;
        font-weight: 500;
        color: rgb(75, 75, 75);
    }
    footer span{
        text-align: center;
    }
</style>