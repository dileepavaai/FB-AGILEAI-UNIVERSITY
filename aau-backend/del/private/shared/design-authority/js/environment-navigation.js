/* ========================================================= */
/* Agile AI Leadership Lab */
/* Environment Navigation Continuity Layer */
/* Version: v1.0 */
/* ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* ===================================================== */
    /* Environment Navigation Mount */
    /* ===================================================== */

    const navigationMount = document.getElementById(
        "environment-navigation"
    );

    if (!navigationMount) {
        return;
    }

    /* ===================================================== */
    /* Environment Configuration */
    /* ===================================================== */

    const currentEnvironment = "classic-agile";

    const environments = {

        "classic-agile": {
            title: "Classic Agile Environment",
            url: "/environments/classic-agile/"
        },

        "agile-ai": {
            title: "Agile AI Environment",
            url: "/environments/agile-ai/"
        }

    };

    /* ===================================================== */
    /* Navigation Relationships */
    /* ===================================================== */

    const navigationMap = {

        "classic-agile": {
            previous: null,
            next: "agile-ai"
        },

        "agile-ai": {
            previous: "classic-agile",
            next: null
        }

    };

    /* ===================================================== */
    /* Current Navigation Context */
    /* ===================================================== */

    const currentNavigation =
        navigationMap[currentEnvironment];

    const previousEnvironment =
        currentNavigation.previous
            ? environments[currentNavigation.previous]
            : null;

    const nextEnvironment =
        currentNavigation.next
            ? environments[currentNavigation.next]
            : null;

    const currentEnvironmentData =
        environments[currentEnvironment];

    /* ===================================================== */
    /* HTML Builder */
    /* ===================================================== */

    navigationMount.innerHTML = `

        <section class="environment-navigation-shell">

            <div class="environment-navigation-card">

                <a
                    class="environment-return-link"
                    href="/"
                >
                    ← Return to Leadership Lab
                </a>

                <div class="environment-navigation-row">

                    ${
                        previousEnvironment
                            ? `
                                <a
                                    class="environment-navigation-item"
                                    href="${previousEnvironment.url}"
                                >

                                    <div>

                                        <span class="environment-navigation-label">
                                            Previous Environment
                                        </span>

                                        <span class="environment-navigation-title">
                                            ${previousEnvironment.title}
                                        </span>

                                    </div>

                                </a>
                            `
                            : ""
                    }

                    <div
                        class="
                            environment-navigation-item
                            current-environment
                        "
                    >

                        <div>

                            <span class="environment-navigation-label">
                                Current Environment
                            </span>

                            <span class="environment-navigation-title">
                                ${currentEnvironmentData.title}
                            </span>

                        </div>

                    </div>

                    ${
                        nextEnvironment
                            ? `
                                <a
                                    class="environment-navigation-item"
                                    href="${nextEnvironment.url}"
                                >

                                    <div>

                                        <span class="environment-navigation-label">
                                            Next Environment
                                        </span>

                                        <span class="environment-navigation-title">
                                            ${nextEnvironment.title}
                                        </span>

                                    </div>

                                </a>
                            `
                            : ""
                    }

                </div>

            </div>

        </section>

    `;

});