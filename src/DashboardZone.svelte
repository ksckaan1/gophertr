<svelte:options tag="dashboard-zone"/>
<script>
let requests;

let new_data={social:{}}
let old_data={social:{}}
let diff = false;


const getRequests = ()=>{
    let req = new XMLHttpRequest();
    req.open("GET", "/admin/api/requests", true)
    req.onload = ()=>{
        if (req.status == 200){
            requests = JSON.parse(req.responseText)
        }
    }
    req.send(null)
}
getRequests()

const showDiff = (req, e)=>{
    e.target.parentNode.nextSibling.nextSibling.classList.toggle("active")
    new_data = req.new_data
    old_data = req.old_data
}

const rejectReq = (request, e)=>{
    let reqID = request.id
    let req = new XMLHttpRequest();
    req.open("GET","/admin/api/request/delete/"+reqID, true)
    req.onload = ()=>{
        if (req.status == 200){
            e.remove()
        }else{
            alert(req.responseText)
        }
    }
    req.send(null)

}
</script>
<div class="content">
    <div class="title">Requests</div>
    {#if requests==undefined}
    Loading...
    {:else if requests.length == 0}
    no request here
    {:else}
    {#each requests as request}
    <div class="request {request.req_type}">
        <div class="head">
            {request.old_data.name}
        </div>
        {#if request.req_type == "edit"}
        <div on:click={(e)=>showDiff(request, e)} class="diff">
            Show Diff
        </div>
        {/if}
        <div class="tail">
            <button class="accept">Accept</button>
            <button on:click={(e)=> rejectReq(request, this)} class="reject">Reject</button>
        </div>
    </div>
    {#if request.req_type == "edit"}
    <div class="diffBox">
        <div class="diffTitle">
            Diffrences
        </div>
        <div class="diffTable">
            <table>
                <thead>
                    <td>Field</td>
                    <td>Old Value</td>
                    <td>New Value</td>
                </thead>
                {#if old_data.name != new_data.name}
                    <tr>
                        <td>Name</td>
                        <td>{old_data.name}</td>
                        <td>{new_data.name}</td>
                    </tr>
                {/if}
                {#if old_data.company != new_data.company}
                    <tr>
                        <td>Company</td>
                        <td>{old_data.company}</td>
                        <td>{new_data.company}</td>
                    </tr>
                {/if}
                {#if old_data.description != new_data.description}
                    <tr>
                        <td>Description</td>
                        <td>{old_data.description}</td>
                        <td>{new_data.description}</td>
                    </tr>
                {/if}
                {#if old_data.profile_img_url != new_data.profile_img_url}
                    <tr>
                        <td>PPImg URL</td>
                        <td>{old_data.profile_img_url}</td>
                        <td>{new_data.profile_img_url}</td>
                    </tr>
                {/if}
                {#if old_data.job_status != new_data.job_status}
                    <tr>
                        <td>Job Status</td>
                        <td>{old_data.job_status}</td>
                        <td>{new_data.job_status}</td>
                    </tr>
                {/if}
                {#if old_data.social.github != new_data.social.github}
                    <tr>
                        <td>GitHub</td>
                        <td>{old_data.social.github}</td>
                        <td>{new_data.social.github}</td>
                    </tr>
                {/if}
                {#if old_data.social.gitlab != new_data.social.gitlab}
                    <tr>
                        <td>GitLab</td>
                        <td>{old_data.social.gitlab}</td>
                        <td>{new_data.social.gitlab}</td>
                    </tr>
                {/if}
                {#if old_data.social.twitter != new_data.social.twitter}
                    <tr>
                        <td>Twitter</td>
                        <td>{old_data.social.twitter}</td>
                        <td>{new_data.social.twitter}</td>
                    </tr>
                {/if}
                {#if old_data.social.facebook != new_data.social.facebook}
                    <tr>
                        <td>Facebook</td>
                        <td>{old_data.social.facebook}</td>
                        <td>{new_data.social.facebook}</td>
                    </tr>
                {/if}
                {#if old_data.social.youtube != new_data.social.youtube}
                    <tr>
                        <td>YouTube</td>
                        <td>{old_data.social.youtube}</td>
                        <td>{new_data.social.youtube}</td>
                    </tr>
                {/if}
                {#if old_data.social.telegram != new_data.social.telegram}
                    <tr>
                        <td>Telegram</td>
                        <td>{old_data.social.telegram}</td>
                        <td>{new_data.social.telegram}</td>
                    </tr>
                {/if}
                {#if old_data.social.instagram != new_data.social.instagram}
                    <tr>
                        <td>Instagram</td>
                        <td>{old_data.social.instagram}</td>
                        <td>{new_data.social.instagram}</td>
                    </tr>
                {/if}
                {#if old_data.social.linkedin != new_data.social.linkedin}
                    <tr>
                        <td>LinkedIn</td>
                        <td>{old_data.social.linkedin}</td>
                        <td>{new_data.social.linkedin}</td>
                    </tr>
                {/if}
                {#if old_data.social.reddit != new_data.social.reddit}
                    <tr>
                        <td>Reddit</td>
                        <td>{old_data.social.reddit}</td>
                        <td>{new_data.social.reddit}</td>
                    </tr>
                {/if}
                {#if old_data.social.email != new_data.social.email}
                    <tr>
                        <td>E-mail</td>
                        <td>{old_data.social.email}</td>
                        <td>{new_data.social.email}</td>
                    </tr>
                {/if}
                {#if old_data.social.kommunity != new_data.social.kommunity}
                    <tr>
                        <td>Kommunity</td>
                        <td>{old_data.social.kommunity}</td>
                        <td>{new_data.social.kommunity}</td>
                    </tr>
                {/if}
                {#if old_data.social.website != new_data.social.website}
                    <tr>
                        <td>Website</td>
                        <td>{old_data.social.website}</td>
                        <td>{new_data.social.website}</td>
                    </tr>
                {/if}

            </table>
            
        </div>
    </div>
    {/if}
    {/each}
    {/if}
</div>

<style>
    .content {
        padding: 20px;
        background-color: rgb(245, 245, 245);
        box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.3);
        color: rgb(73, 73, 73);
        border-radius: 2px;
    }
    .title{
        font-size: 25px;
        font-weight: bold;
        margin-bottom: 20px;
    }
    .diff{
        cursor: pointer;
    }

    .request{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 10px;
        gap: 10px;
        margin-bottom: 10px;
        border-radius: 2px;
        /* box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.3); */
    }
    .edit{
        background-color: deepskyblue;
        color: white;
    }
    .delete{
        background-color: crimson;
        color: white;
    }
    .accept{
        background-color: rgba(0, 0, 0, 0.3);
        color: white;
        border: 0px;
        border-radius: 2px;
        padding: 5px 10px;
        cursor: pointer;
    }
    .reject{
        background-color: transparent;
        color: white;
        border: 0px;
        border-radius: 2px;
        padding: 5px 10px;
        cursor: pointer;
    }

    .diffBox{
        display: none;
        flex-direction: column;
        background-color: #0086b2;
        color: white;
        bottom: 0px;
        left: 0px;
        width: 100%;
        overflow: hidden;
        margin-bottom: 10px;
        border-radius: 2px;
        padding: 10px;
        box-sizing: border-box;
    }
    .active{
        display: flex;
    }
    .diffTitle{
        font-size: 30px;
        color: rgba(255, 255, 255, 0.7);
    }
    table{
        width: 100%;
    }
    thead{
        font-weight: bold;
        border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    }
</style>