


window.onload = evt => {
    document.forms.loretta.onsubmit = evt => {
        const { submitter } = evt;

        if( submitter.getAttribute( "data" ) == 1 ) {
            alert( "Correct!  You may advance." );
        } else {
            alert( "Wrong.  You suck." );
        }

    };
};

