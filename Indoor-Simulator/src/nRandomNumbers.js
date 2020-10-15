module.exports = function NRandomNumbers(min, max, count) {
    let numbers = [];

    for (let i = 0; i < count; i++) {
        let n =  Math.floor(Math.random() * max) + min;
        let check = numbers.includes(n);

        if(check === false) {
            numbers.push(n);
        } else {
            while(check === true){
                n = Math.floor(Math.random() * max) + min;
                check = numbers.includes(n);
                if(check === false){
                    numbers.push(n);
                }
            }
        }
    }

    // numbers.sort(function(a, b){return a-b});

    return numbers
    // console.log(numbers)
}
