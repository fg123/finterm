const inputField = $("input.input_line");

const state = new State();

const history = [""];
let current_prompt = 0;

inputField.keypress((e) => {
    if (e.which === 13) {
        // Make a new fake input field
        $(".history").append(`<div class="input_line">${inputField.val()}</div>`);
        try {
            const results = state.Evaluate(inputField.val());
            $(".history").append(`<div class="results">${results.join('\n')}</div>`);
            inputField.val("");
            console.log($(".main_wrapper").prop('scrollHeight'));
            $(".main_wrapper").scrollTop($(".main_wrapper").prop('scrollHeight'));
        }
        catch (e) {
            console.error(e);
        }
        history[history.length - 1] = inputField.val();
        history.push("");
        current_prompt = history.length - 1;
    }
    else if (e.which === 38) {
    	// Up Arrow
    	if (current_prompt > 0) current_prompt -= 1;
    	inputField.val(history[current_prompt]);
    }
    else if (e.which === 40) {
    	if (current_prompt < history.length - 1) current_prompt += 1;
    	inputField.val(history[current_prompt]);
    }
    else {
    	history[current_prompt] = inputField.val();
    }

    console.log(history);
});
