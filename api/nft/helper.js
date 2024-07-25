
// getIPFSData 
exports.getIPFSData = (Uri) => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await fetch(Uri);
            if (parseInt(data.status) == 200) {
                data = await data.json();
                return resolve(data);
            }
            if (parseInt(data.status) == 404) {
                data = await fetch(`${Uri}.json`);
                if (parseInt(data.status) == 200) {
                    data = await data.json();
                    return resolve(data);
                } else {
                    return resolve({ name: "", description: "", image: "" });
                }
            }
        } catch (e) {
            return reject("Invalid Uri");
        }
    });
}

// get nonce 
exports.getNonce = () => {
    return new Promise(async (resolve, reject) => {
        try {
          const timestamp = new Date().getTime();
          const min = Math.ceil(timestamp / 10000000);
          const max = min * 10000000000;
          const nonce = Math.floor(Math.random() * (max - min + 1)) + min;
          resolve(nonce);
        } catch (e) { reject(e) }
      });
}
