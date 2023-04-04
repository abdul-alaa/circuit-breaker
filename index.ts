import { SamplingBreaker, circuitBreaker, handleAll } from "cockatiel";
import axios from "axios";


let api = axios.create({
    baseURL: "https://jsonplaceholder.typicode.com/",
    timeout: 400,
});


const breaker = circuitBreaker(handleAll, {
    halfOpenAfter: 5, // time to try when was open 
    breaker: new SamplingBreaker({
        threshold: .5,
        duration: 500, // Open time  
        minimumRps: 5, // require 5 requests per second before we can break
    }),
});

breaker.onHalfOpen(e => {
    api = axios.create({
        baseURL: "https://jsonplaceholder.typicode.com/",
        timeout: 410,
    });
    console.log('onHalfOpen:');
})
breaker.onBreak(e => console.log('onBreak:'))
breaker.onReset(e => console.log('onReset:', e))

async function main() {
    for (let i = 0; i < 50; i++) {
        try {
            const response = await breaker.execute(async () => {
                const res = await api.get("todos/1");
                return res.data;
            });
            console.log("Response:", response);
        } catch (error: any) {
            console.log(`Error: ${error.message}, Circuit State: ${breaker.state}`);
        }
    }
}
main();