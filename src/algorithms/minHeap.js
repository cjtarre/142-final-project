export class MinHeap {
    constructor(compareFn = (a, b) => a - b) {
        this.heap = [];
        this.compareFn = compareFn;
    }
    parent(i)     {return Math.floor((i - 1) / 2);}
    leftChild(i)  {return 2 * i + 1;}
    rightChild(i) {return 2 * i + 2;}
    swap(i, j)    {[this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];}

    bubbleUp(i)   {
            while (i > 0 && this.compareFn(this.heap[i], this.heap[this.parent(i)]) < 0) {
                this.swap(i, this.parent(i));
                i = this.parent(i);
            }
        }

    bubbleDown(i) {
        while (true) {
        let smallest = i;     const left = this.leftChild(i);   const right = this.rightChild(i);

        if (left < this.heap.length && this.compareFn(this.heap[left], this.heap[smallest]) < 0)      smallest = left;
        if (right < this.heap.length && this.compareFn(this.heap[right], this.heap[smallest]) < 0)    smallest = right;
        if (smallest !== i) { this.swap(i, smallest); i = smallest;} 
        else break; 
        }
    }

    insert(element) {
        this.heap.push(element);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();
        
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }

    peek()    {return this.heap[0] || null;}
    isEmpty() {return this.heap.length === 0;}
    size()    {return this.heap.length;}

    update(oldElement, newElement) {
        const index = this.heap.findIndex( (el) => el.id === oldElement.id );

        if (index === -1) return false;
    
        this.heap[index] = newElement;

        // Determine whether to bubble up or down based on comparison
        if (index > 0 && this.compareFn(this.heap[index], this.heap[this.parent(index)]) < 0) 
                this.bubbleUp(index);     
        else    this.bubbleDown(index);

        return true;
    }

    toArray() {return [...this.heap];}
}
