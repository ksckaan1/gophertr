<svelte:options tag="gopher-list" />

<script>
	import { fade } from "svelte/transition"
	import LoadingGophers from "./LoadingGophers.svelte"
	let filteredGophers = []

	let allGophers = [];

	let isPageLoaded = false

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

	async function fetchAllGophers() {
		var everyBody = document.querySelector("body")
		everyBody.style.overflow= "hidden"
		var req = new XMLHttpRequest();
		req.open("GET", "/api/gophers/", true);
		req.onload = () => {
			if (req.status == 200) {
				filteredGophers = JSON.parse(req.responseText);
				filteredGophers.forEach((gopher) => {
					if (gopher.profile_img_url == undefined) {
						gopher.profile_img_url = genRandomGopherPP();
					}
				});
				allGophers = filteredGophers;
				everyBody.style.overflow= "auto"

			}
		};
		req.send(null);
	}
	fetchAllGophers();

	const searchGopher = (e) => {
		var gophers = [];
		allGophers.forEach((gopher) => {
			var name = gopher.name.toLowerCase();
			if (name.includes(e.currentTarget.value.toLowerCase())) {
				gophers = [...gophers, gopher];
			}
		});
		filteredGophers = gophers;
	};

	const showAllGophers = () => {
		filteredGophers = allGophers;
	};
	const showOnlyLooking = () => {
		let gophers = [];
		allGophers.forEach((gopher) => {
			if (gopher.job_status == "looking") {
				gophers = [...gophers, gopher]
			}
		});
		filteredGophers = gophers;
	};

	const showOnlyHiring = () => {
		let gophers = [];
		allGophers.forEach((gopher) => {
			if (gopher.job_status == "hiring") {
				gophers = [...gophers, gopher]
			}
		});
		filteredGophers = gophers;
	};

	const showOnlyWorking = () => {
		let gophers = [];
		allGophers.forEach((gopher) => {
			if (gopher.company != undefined) {
				gophers = [...gophers, gopher]
			}
		});
		filteredGophers = gophers;
	};

	const showOnlyNotWorking = () => {
		let gophers = [];
		allGophers.forEach((gopher) => {
			if (gopher.company == undefined) {
				gophers = [...gophers, gopher]
			}
		});
		filteredGophers = gophers;
	};

	const editGopherBtn = (id)=>{
			location.href="/edit-request/"+id;
	}
	const editGopherBtnAdmin = (id)=>{
			location.href="/admin/edit/"+id;
	}
</script>
<link rel="stylesheet" href="/public/global.css" />
{#if allGophers.length == 0}
	 <loading-gophers/>
{:else}
<div class="filterZone" in:fade>
	<input
		class="searchInput"
		on:keyup={searchGopher}
		type="text"
		value=""
		placeholder="Gopher Ara..."
	/>
	<button on:click={showAllGophers} class="filterButton">Tümü</button>
	<button on:click={showOnlyLooking} class="filterButton lookingButton"
		>İş Arayanlar</button
	>
	<button on:click={showOnlyHiring} class="filterButton hiringButton"
		>İş Verenler</button
	>
	<button on:click={showOnlyWorking} class="filterButton">Çalışanlar</button>
	<button on:click={showOnlyNotWorking} class="filterButton"
		>Çalışmayanlar</button
	>
</div>
<div class="gophers" in:fade>
	{#each filteredGophers as gopher}
		<div class="gopher" cardType={gopher.job_status} transition:fade>
			<div class="leftSide">
				<div class="companySide">
					{gopher.company || "Çalışmıyor"}
				</div>
				<div class="avatar" style="--avatar: url({gopher.profile_img_url});">
					<button on:click={editGopherBtn(gopher.id)} class="editBtn">🖉</button>
				</div>
				<div class="jobStatusSide">
					{#if gopher.job_status == "looking"}İş Arıyor{:else if gopher.job_status == "hiring"}Çalışan
						Arıyor{:else if gopher.company}Çalışıyor{/if}
				</div>
			</div>
			<div class="rightSide">
				<div class="topSide">
					<div class="name">{gopher.name}</div>
					<div class="description">
						{gopher.description || "Açıklama Bulunmuyor"}
					</div>
				</div>
				<div class="socialLinks">
					{#if gopher.social.github}<a
							href="https://github.com/{gopher.social.github}"
							target="_blank"><i class="github" /></a
						>{/if}
					{#if gopher.social.gitlab}<a
							href="https://gitlab.com/{gopher.social.gitlab}"
							target="_blank"><i class="gitlab" /></a
						>{/if}
					{#if gopher.social.twitter}<a
							href="https://twitter.com/{gopher.social.twitter}"
							target="_blank"><i class="twitter" /></a
						>{/if}
					{#if gopher.social.facebook}<a
							href="https://facebook.com/{gopher.social.facebook}"
							target="_blank"><i class="facebook" /></a
						>{/if}
					{#if gopher.social.youtube}<a
							href="https://youtube.com/{gopher.social.youtube}"
							target="_blank"><i class="youtube" /></a
						>{/if}
					{#if gopher.social.instagram}<a
							href="https://instagram.com/{gopher.social
								.instagram}"
							target="_blank"><i class="instagram" /></a
						>{/if}
					{#if gopher.social.telegram}<a
							href="https://t.me/{gopher.social.telegram}"
							target="_blank"><i class="telegram" /></a
						>{/if}
					{#if gopher.social.linkedin}<a
							href="https://linkedin.com/in/{gopher.social
								.linkedin}"
							target="_blank"><i class="linkedin" /></a
						>{/if}
					{#if gopher.social.reddit}<a
							href="https://reddit.com/u/{gopher.social.reddit}"
							target="_blank"><i class="reddit" /></a
						>{/if}
					{#if gopher.social.kommunity}<a
							href="https://kommunity.com/@{gopher.social
								.kommunity}"
							target="_blank"><i class="kommunity" /></a
						>{/if}
					{#if gopher.social.email}<a
							href={"mailto:" + gopher.social.email}
							target="_blank"><i class="email" /></a
						>{/if}
					{#if gopher.social.website}<a
							href={gopher.social.website}
							target="_blank"><i class="website" /></a
						>{/if}
				</div>
			</div>
		</div>
	{/each}
</div>
{/if}

<style>
	.avatar{
		background: var(--avatar);
		display: flex;
		justify-content: center;
		align-items: center;
		
	}
	.editBtn{
		opacity: 0;
		border: 0px;
		border-radius: 2px;
		background-color: #1f0f40;
		color: white;
		width: 40px; height: 40px;
		transition: opacity .5s;
		cursor: pointer;
	}

	[cardType="looking"] .editBtn{
		background-color: #0f610f;
	}

	[cardType="hiring"] .editBtn{
		background-color: #8c4b00;
	}

	.avatar:hover .editBtn{
		opacity: 1;
	}

	i {
		background-size: 24px;
		background-repeat: no-repeat;
		width: 24px;
		height: 24px;
		display: inline-block;
		opacity: .7;
		transition: opacity .3s;
	}
	i:hover{
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
