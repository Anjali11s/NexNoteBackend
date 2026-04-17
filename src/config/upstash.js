import {Ratelimit} from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

import dotenv from 'dotenv';


dotenv.config();

// create a rate limiter that allows 100 requests for 1 minute
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100,'60 s') // sliding window technique , 10:no of request , 20 s: s for second 
})

export default ratelimit;