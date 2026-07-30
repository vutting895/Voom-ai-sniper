import numpy as np

class TradingEnvironment:
    def __init__(self, prices):
        self.prices = prices
        self.index = 0

    def reset(self):
        self.index = 0
        return self.prices[0]

    def step(self, action):
        self.index += 1
        done = self.index >= len(self.prices)-1
        reward = self.prices[self.index] - self.prices[self.index-1]
        return self.prices[self.index], reward, done


if __name__ == "__main__":
    env = TradingEnvironment([100,101,103,102])
    print(env.reset())
