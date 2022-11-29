class Greet {
         greet: boolean;

         constructor() {
                  this.greet = false;
         }

         greeted() {
                  this.greet = true;
         }
}

const greet = new Greet();
export function didGreet() {
         return greet.greet;
}

export function greeted() {
         greet.greeted();
} 