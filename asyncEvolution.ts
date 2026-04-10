type Grade = 'vip' | 'basic' | 'gold';

type User = {
  id: string;
  name: string;
  grade: Grade;
};

type Callback<T> = (error: Error | null, value?: T) => void;

const users: Record<string, User> = {
  u1: { id: 'u1', name: 'kim', grade: 'vip' },
  u2: { id: 'u2', name: 'lee', grade: 'basic' },
  broken: { id: 'broken', name: 'park', grade: 'gold' },
};

const discountRates: Partial<Record<Grade, number>> = {
  vip: 0.1,
  basic: 0.03,
};

function getUserCallback(userId: string, callback: Callback<User>): void {
  setTimeout(() => {
    const user = users[userId];

    if (!user) {
      callback(new Error('USER_NOT_FOUND'));
      return;
    }

    callback(null, user);
  }, 30);
}

function getDiscountRateCallback(
  grade: Grade,
  callback: Callback<number>,
): void {
  setTimeout(() => {
    const rate = discountRates[grade];

    if (rate == null) {
      callback(new Error('RATE_NOT_FOUND'));
      return;
    }

    callback(null, rate);
  }, 30);
}

function getUserPromise(userId: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users[userId];

      if (!user) {
        reject(new Error('USER_NOT_FOUND'));
        return;
      }

      resolve(user);
    }, 30);
  });
}

function getDiscountRatePromise(grade: Grade): Promise<number> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const rate = discountRates[grade];

      if (rate == null) {
        reject(new Error('RATE_NOT_FOUND'));
        return;
      }

      resolve(rate);
    }, 30);
  });
}

function formatPaymentMessage(
  userName: string,
  originalPrice: number,
  rate: number,
): string {
  const finalPrice = originalPrice * (1 - rate);
  return `${userName}님의 최종 결제 금액은 ${finalPrice}원입니다.`;
}

// 1. callback 버전
function buildPaymentMessageCallback(
  userId: string,
  originalPrice: number,
  callback: Callback<string>,
): void {
  return getUserCallback(userId, (error, user) => {
    if (!user) return callback(error);

    return getDiscountRateCallback(user.grade, (error, rate) => {
      if (!rate) return callback(error);

      return callback(
        null,
        formatPaymentMessage(user.name, originalPrice, rate),
      );
    });
  });
}

async function buildPaymentMessagePromise(
  userId: string,
  originalPrice: number,
): Promise<string> {
  return getUserPromise(userId)
    .then((user) => {
      return getDiscountRatePromise(user.grade).then((rate) => ({
        rate,
        name: user.name,
      }));
    })
    .then(({ rate, name }) => formatPaymentMessage(name, originalPrice, rate));
}

// 3. async/await 버전
async function buildPaymentMessageAsync(
  userId: string,
  originalPrice: number,
): Promise<string> {
  try {
    const user = await getUserPromise(userId);
    const rate = await getDiscountRatePromise(user.grade);
    return formatPaymentMessage(user.name, originalPrice, rate);
  } catch (error) {
    throw error;
  }
}
export {
  buildPaymentMessageAsync,
  buildPaymentMessageCallback,
  buildPaymentMessagePromise,
  formatPaymentMessage,
  getDiscountRateCallback,
  getDiscountRatePromise,
  getUserCallback,
  getUserPromise,
};
