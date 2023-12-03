<link
	href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css"
	rel="stylesheet"
	integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9"
	crossorigin="anonymous"
/>

<nav class="navbar navbar-expand-lg bg-body-tertiary">
	<div class="container-fluid">
		<a class="navbar-brand" href="/">Uimf</a>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarSupportedContent"
			aria-controls="navbarSupportedContent"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon" />
		</button>
		<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav me-auto mb-2 mb-lg-0">
				<li class="nav-item">
					<a class="nav-link active" aria-current="page" href="/">Docs</a>
				</li>
				<!-- <li class="nav-item">
					<a class="nav-link" href="#">Link</a>
				</li> -->
			</ul>
			<!-- <form class="d-flex" role="search">
				<input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
				<button class="btn btn-outline-success" type="submit">Search</button>
			</form> -->
		</div>
	</div>
</nav>
<div class="my-container container-xxl">
	<div class="row">
		<div class="col-3">
			<strong>Component Essentials</strong>
			<ul class="list-group list-group-flush">
				<li class="list-group-item"><a href="/demo/componentMetadata">ComponentMetadata</a></li>
			</ul>
			<strong>Inputs</strong>
			<ul class="list-group list-group-flush">
				<li class="list-group-item"><a href="/demo/inputs/text">Text</a></li>
				<li class="list-group-item"><a href="/demo/inputs/radio">Radio</a></li>
				<li class="list-group-item"><a href="/demo/inputs/smartNavigator">Smart Navigator</a></li>
				<li class="list-group-item"><a href="/demo/inputs/fileUpload">File Uploader</a></li>
				<li class="list-group-item"><a href="/demo/inputs/nestedInput">Nested Input</a></li>
				<li class="list-group-item">
					<a href="/demo/inputs/conditionalInput">Conditional Input</a>
				</li>
				<li class="list-group-item"><a href="/demo/inputs/dateTime">Date Time</a></li>
				<li class="list-group-item"><a href="/demo/inputs/number">Number</a></li>
				<li class="list-group-item"><a href="/demo/inputs/dropdown">Dropdown</a></li>
				<li class="list-group-item"><a href="/demo/inputs/richtexteditor">Rich Text Editor</a></li>
			</ul>

			<strong>Outputs</strong>
			<ul class="list-group list-group-flush">
				<li class="list-group-item"><a href="/demo/outputs/text">Text</a></li>
				<li class="list-group-item"><a href="/demo/outputs/image">Image</a></li>
				<li class="list-group-item"><a href="/demo/outputs/stateDiagram">StateDiagram</a></li>
				<li class="list-group-item"><a href="/demo/outputs/imageOverlay">ImageOverlay</a></li>
				<li class="list-group-item">
					<a href="/demo/outputs/paginatedObjectList">PaginatedObjectList</a>
				</li>
			</ul>
		</div>
		<div class="col-6">
			<slot />
		</div>
	</div>
</div>

<style lang="scss">
	.col-6 {
		width: 70%;
	}

	.my-container {
		padding-top: 2%;
	}
</style>
