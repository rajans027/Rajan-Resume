import fetch from 'node-fetch'
async function get_visitors() {
    // call post api request function
    //await post_visitor();
    try {
        let response = await fetch('https://ff5nzusjg9.execute-api.us-east-1.amazonaws.com/prod/GET', {
            method: 'GET',
			headers: {
            }
        });
        let data = await response.json()
        document.getElementById("view-count").innerHTML = data['count'] + " visits.";
        console.log(data);
        return data;
    } catch (err) {
        console.error(err);
    }
}


// // get_visitors();
// import fetch from 'node-fetch'
// function updateCounter(){
//     fetch("https://1ytuhzerk9.execute-api.us-east-1.amazonaws.com/get/")
//       .then(response => response.text())
//       .then((body) => {
//         document.getElementById("counter").innerHTML=body
//       })
//       .catch(function(error) {
//         console.log(error); 
//       });  
//     }  
// updateCounter();