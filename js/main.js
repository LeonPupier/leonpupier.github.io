// --------------------------------------------------------------------------------
// ----------------------------------- Router -------------------------------------
// --------------------------------------------------------------------------------

let isPopStateEvent = false;

// Create a new router
const router = {

	routes: {
		// Main
		'/': renderHomePage,
		'/home': renderHomePage,
	},

	navigate: function(route) {
		// Check if the route is a string
		if (typeof route !== 'string') {
			return;
		}

		// Find the matching route
		const matchingRoute = Object.keys(this.routes).find(r => {
			const regex = new RegExp(`^${r.replace(/:[^\s/]+/g, '([\\w-]+)')}$`);
			return regex.test(route);
		});
	
		if (matchingRoute) {
			// Extract the parameters
			const params = route.match(new RegExp(matchingRoute.replace(/:[^\s/]+/g, '([\\w-]+)'))).slice(1);
	
			// Call the corresponding function with the parameters
			this.routes[matchingRoute](...params);
			
			// Add the new route to the history
			if (!isPopStateEvent) {
				history.pushState({ route: route }, '', route);
			}
			isPopStateEvent = false;
		
		} else {
			// If no route is found
			console.error('Route not found:', route);
		}
	}
};


// --------------------------------------------------------------------------------
// ----------------------------- Navigation & Routing -----------------------------
// --------------------------------------------------------------------------------


// When the user clicks on a link, navigate to the given route
async function navigateTo(event, route) {
	event.preventDefault();
	router.navigate(route);
}


// Handle the navigation when the user clicks on a link
document.addEventListener('click', function(event) {
	let target = event.target;
	while (target !== document) {
		if (!target) return;
		if ((target.tagName === 'BUTTON' || target.tagName === 'A') && !target.hasAttribute('data-ignore-click')) {
			event.preventDefault();
			navigateTo(event, target.getAttribute('data-route'));
			return;
		}
		target = target.parentNode;
	}
});


// Handle the navigation when the user clicks on the back or forward button
window.addEventListener('popstate', function(event) {
	if (event.state && event.state.route) {
		isPopStateEvent = true;
		router.navigate(event.state.route);
	}
});


// --------------------------------------------------------------------------------
// ---------------------------------- Observer ------------------------------------
// --------------------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', (event) => {
	if (sessionStorage.redirect) {
		const redirectURL = sessionStorage.redirect;
		delete sessionStorage.redirect;
		router.navigate(redirectURL.replace(location.origin, ''));
	} else {
		router.navigate(window.location.pathname);
	}

	// Handle the menu button
	document.getElementById('menu').addEventListener('click', function() {
		this.classList.remove('clicked');
		void this.offsetWidth;
		this.classList.add('clicked');

		var panel = document.getElementById('menu-panel');
		var wave = document.getElementById('wave');
		var style = window.getComputedStyle(panel);

		if (style.left === '-300px') {
			panel.style.left = '0px';
			wave.style.left = '300px';
			wave.style.zIndex = '2';
		} else {
			panel.addEventListener('transitionend', function hideWave() {
				wave.style.zIndex = '-1';
				panel.removeEventListener('transitionend', hideWave);
			});
			panel.style.left = '-300px';
			wave.style.left = '0px';
		}
	});
});