document.querySelector('#ps').onclick = () => {
    myFetch('/signup');
}

document.querySelector('#pl').onclick = () => {
    myFetch('/login');
}

const myFetch = (url) => {
        let user = {
            email: 'xded2@mail.com',
            password: 'P@$$w0rd'
        };
    console.log(`---POST ${url}, ${JSON.stringify(user)}`);
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(user)
    })
    .then(res => {
        return res.json();
        if (res.ok) return res.json();
        console.log(res);
        throw new Error(res.status);
    })
    .then(jsonResponse => console.log('-----', jsonResponse))
    .catch(networkError => console.log('++++++',networkError));
}
