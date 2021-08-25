const inputField = $("input.input_line");

const state = new State();

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
    }
});