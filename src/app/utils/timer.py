import multiprocessing
import time 

class Timer:

    def __init__(self):
        self.elapsed_time = multiprocessing.Value('d', 0.0)
        self.process = None
        self.lock = multiprocessing.Lock()

    def print_elapsed_time(self):
        start_time = time.time()
        while True:
            elapsed_time = time.time() - start_time
            with self.lock:
                self.elapsed_time.value = elapsed_time
            print(f"Elapsed time: {elapsed_time:.0f} seconds", end='\r')
            time.sleep(1)

    def start(self):
        self.process = multiprocessing.Process(target=self.print_elapsed_time)
        self.process.start()

    def end(self):
        self.process.terminate()
        elapsed_time = self.elapsed_time.value
        print(f"Elapsed time: {elapsed_time:.0f} seconds ✅\n\n", end='\r')


timer = Timer()