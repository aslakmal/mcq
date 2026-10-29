function renderTimetable(timetableData, daysContainer, daySelector) {

    const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday"
    ];

    const dayNames = {
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday"
    };


    if (!daysContainer || !daySelector) {
        return;
    }


    if (
        !timetableData ||
        typeof timetableData !== "object" ||
        Array.isArray(timetableData)
    ) {
        daysContainer.innerHTML = `
            <div class="day-empty">
                Free
            </div>
        `;

        daySelector.innerHTML = "";

        return;
    }


    daysContainer.innerHTML = "";
    daySelector.innerHTML = "";


    function getPeriods(dayData) {

        if (!dayData) {
            return [];
        }


        // Array format
        if (Array.isArray(dayData)) {

            return dayData.map((data, index) => ({
                period: index,
                data: data
            }));

        }


        // Object format
        if (typeof dayData === "object") {

            return Object.entries(dayData)
                .map(([period, data]) => ({
                    period: Number(period),
                    data: data
                }))
                .filter(item => !isNaN(item.period));

        }


        return [];
    }


    /*
     * First find the maximum period
     * used by any day.
     */
    let maxPeriods = 0;


    days.forEach(day => {

        const periods = getPeriods(
            timetableData[day]
        );

        if (periods.length) {

            const dayMax = Math.max(
                ...periods.map(item => item.period)
            );

            maxPeriods = Math.max(
                maxPeriods,
                dayMax
            );
        }
    });


    /*
     * No periods anywhere
     */
    if (maxPeriods === 0) {

        daysContainer.innerHTML = `
            <div class="day-empty">
                Free
            </div>
        `;

        return;
    }


    /*
     * Render all five days
     */
    days.forEach((day, dayIndex) => {

        const dayData = timetableData[day];

        const periods = getPeriods(dayData);


        const column = document.createElement("div");

        column.className = "day-column";
        column.dataset.day = day;


        if (dayIndex === 0) {
            column.classList.add("active");
        }


        // Header
        const header = document.createElement("div");

        header.className = "day-header";


        const name = document.createElement("div");

        name.className = "day-name";
        name.textContent = dayNames[day];


        const assignedCount = periods.filter(
            item => item.data
        ).length;
        header.appendChild(name);
/*
        const count = document.createElement("div");

        count.className = "period-count";
        count.textContent = `${assignedCount} classes`;


        
        header.appendChild(count);
*/
        column.appendChild(header);


        // Period container
        const periodsContainer = document.createElement("div");

        periodsContainer.className = "periods";


        /*
         * Always render maxPeriods.
         */
        for (let i = 1; i <= maxPeriods; i++) {

            const periodObj = periods.find(
                item => item.period === i
            );


            const data = periodObj
                ? periodObj.data
                : null;


            const period = document.createElement("div");

            period.className = "period";


            if (!data) {
                period.classList.add("empty");
            }


            // Period number
            const number = document.createElement("div");

            number.className = "period-number";
            number.textContent = i;

            period.appendChild(number);


            if (data) {

                const info = document.createElement("div");

                info.className = "period-info";


                const subject = document.createElement("div");

                subject.className = "subject";
                subject.textContent =
                    data.s || "Unknown subject";


                const className = document.createElement("div");

                className.className = "class-name";
                className.textContent = data.c || "";


                info.appendChild(subject);
                info.appendChild(className);

                period.appendChild(info);

            } else {

                const emptyText = document.createElement("div");

                emptyText.className = "empty-text";
                emptyText.textContent = "Free";

                period.appendChild(emptyText);
            }


            periodsContainer.appendChild(period);
        }


        column.appendChild(periodsContainer);

        daysContainer.appendChild(column);


        // Mobile day button
        const button = document.createElement("button");

        button.className = "day-btn";

        if (dayIndex === 0) {
            button.classList.add("active");
        }

        button.textContent = dayNames[day];


        button.addEventListener("click", () => {

            if (button.classList.contains("active")) {
                return;
            }


            daySelector.querySelectorAll(".day-btn")
                .forEach(btn => {
                    btn.classList.remove("active");
                });


            daysContainer.querySelectorAll(".day-column")
                .forEach(item => {
                    item.classList.remove("active");
                });


            button.classList.add("active");


            const selectedDay =
                daysContainer.querySelector(
                    `.day-column[data-day="${day}"]`
                );


            if (selectedDay) {
                selectedDay.classList.add("active");
            }
        });


        daySelector.appendChild(button);
    });
}

