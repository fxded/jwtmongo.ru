document.querySelector('#ps').onclick = () => {
    myFetch('/signup');
}

document.querySelector('#pl').onclick = () => {
    myFetch('/login');
}

const myFetch = (url) => {
        let user = {
            email: 'xded@mail.ru',
            password: 'P@$$w0rd'
        };
    console.log(`POST ${url}, ${JSON.stringify(user)}`);
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(user)
    })
    .then(res => {
        if (res.ok) return res.json();
        throw new Error('Request is failed!');
    }, networkError => console.log(networkError.message))
    .then(jsonResponse => console.log(jsonResponse));
}
