<svelte:options tag="show-info"/>
<script>
    import {fade} from "svelte/transition";
    export let close = false;
    let isActive= true;

    const closeInfo = ()=>{
        isActive = false;
    }



</script>
{#if isActive}
<div class="info" out:fade>
    <div class="text">
        <slot></slot>
    </div>
    {#if close}
    <button on:click={closeInfo} class="closeBtn"></button>
    {/if}
</div>
{/if}
<style>
.info{
    display: flex;
    align-items: flex-start;
    padding: 10px 20px;
    border-left: 8px solid #411f89;
    border-radius: 2px;
    background-color: rgb(245, 245, 245);
    color: rgb(53, 53, 53);
    box-shadow: 0px 3px 10px rgba(0,0,0,0.3);
    margin-bottom: 30px;
}
.text{
    flex: 1;
}
.closeBtn{
    background-size: 24px;
    background: url("/public/img/icons/close.png");
    width: 24px;
    height: 24px;
    border: 0;
    cursor: pointer;
}
</style>
