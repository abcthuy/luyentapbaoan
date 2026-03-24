import { Question } from '../types';

type McqSeed = {
    text: string;
    options: string[];
    answer: string;
};

type PassageSeed = {
    text: string;
    instruction: string;
};

type WritingSeed = {
    text: string;
    answer: string;
    hint?: string;
};

function pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

function clampLevel(level: number) {
    return Math.max(1, Math.min(3, Math.round(level || 1)));
}

function getBalancedEnglishLevel(skillId: string, level: number) {
    const safeLevel = clampLevel(level);

    if (skillId.startsWith('eng2-')) {
        return Math.min(safeLevel, 2);
    }

    return safeLevel;
}

function getListeningSeeds(skillId: string, level: number): McqSeed[] {
    const isGrade3 = skillId.startsWith('eng3');

    if (!isGrade3) {
        if (level === 1) {
            return [
                { text: 'I see a red ball.', options: ['Ball', 'Book', 'Bag', 'Pen'], answer: 'Ball' },
                { text: 'Two cats are here.', options: ['One', 'Two', 'Three', 'Four'], answer: 'Two' },
                { text: 'This is my blue bag.', options: ['Blue', 'Green', 'Black', 'Pink'], answer: 'Blue' },
                { text: 'I drink milk.', options: ['Milk', 'Tea', 'Soup', 'Juice'], answer: 'Milk' },
            ];
        }

        if (level === 2) {
            return [
                { text: 'The boy is under the table.', options: ['Under the table', 'On the chair', 'In the box', 'At the door'], answer: 'Under the table' },
                { text: 'My mother goes to work by bus.', options: ['By bike', 'By bus', 'On foot', 'By train'], answer: 'By bus' },
                { text: 'There are five books on the desk.', options: ['Three', 'Four', 'Five', 'Six'], answer: 'Five' },
                { text: 'Lan has a doll and a kite.', options: ['A kite', 'A pencil', 'A ruler', 'A cake'], answer: 'A kite' },
            ];
        }

        return [
            { text: 'It is rainy today, so I take my umbrella to school.', options: ['Umbrella', 'Hat', 'Shoes', 'Notebook'], answer: 'Umbrella' },
            { text: 'My father cooks noodles, eggs, and soup for dinner.', options: ['Rice', 'Soup', 'Fish', 'Bread'], answer: 'Soup' },
            { text: 'The library is next to the classroom and near the yard.', options: ['Near the yard', 'In the house', 'On the bus', 'At the zoo'], answer: 'Near the yard' },
            { text: 'Mai gets up at six o’clock and brushes her teeth first.', options: ['At five', 'At six', 'At seven', 'At eight'], answer: 'At six' },
        ];
    }

    if (level === 1) {
        return [
            { text: 'My favorite subject is English.', options: ['Math', 'English', 'Art', 'Music'], answer: 'English' },
            { text: 'We play badminton after school.', options: ['Badminton', 'Chess', 'Hide-and-seek', 'Marbles'], answer: 'Badminton' },
            { text: 'There is a sofa in the living room.', options: ['Kitchen', 'Living room', 'Bathroom', 'Garden'], answer: 'Living room' },
            { text: 'The dress is yellow and pretty.', options: ['Yellow', 'Blue', 'Red', 'White'], answer: 'Yellow' },
        ];
    }

    if (level === 2) {
        return [
            { text: 'Nam has breakfast at seven and goes to school at half past seven.', options: ['At six', 'At seven', 'At eight', 'At nine'], answer: 'At seven' },
            { text: 'My little sister likes chicken and orange juice for lunch.', options: ['Milk', 'Orange juice', 'Tea', 'Water'], answer: 'Orange juice' },
            { text: 'There are two bedrooms upstairs and one kitchen downstairs.', options: ['One bedroom', 'Two bedrooms', 'Three bedrooms', 'Four bedrooms'], answer: 'Two bedrooms' },
            { text: 'The children are flying kites because the weather is windy and cool.', options: ['Rainy', 'Windy', 'Snowy', 'Hot'], answer: 'Windy' },
        ];
    }

    return [
        { text: 'On Sunday, my family visits my grandparents and we have lunch together.', options: ['On Friday', 'On Saturday', 'On Sunday', 'On Monday'], answer: 'On Sunday' },
        { text: 'The robot in the toy shop is expensive, but the small car is cheaper.', options: ['The robot', 'The small car', 'The kite', 'The ball'], answer: 'The small car' },
        { text: 'Linh waters the plants, feeds the fish, and cleans her desk every afternoon.', options: ['In the morning', 'At noon', 'Every afternoon', 'At night'], answer: 'Every afternoon' },
        { text: 'My uncle works in a hospital, so he often helps sick people.', options: ['At a school', 'At a farm', 'At a hospital', 'At a store'], answer: 'At a hospital' },
    ];
}

function getReadAloudSeeds(skillId: string, level: number): PassageSeed[] {
    const isGrade3 = skillId.startsWith('eng3');

    if (!isGrade3) {
        if (level === 1) {
            return [
                { instruction: 'Đọc to câu sau:', text: 'Hello. My name is Ben.' },
                { instruction: 'Đọc to câu sau:', text: 'I have two red books.' },
                { instruction: 'Đọc to câu sau:', text: 'The cat is on the chair.' },
            ];
        }

        if (level === 2) {
            return [
                { instruction: 'Đọc rõ từng câu:', text: 'My house is small. It has a blue door.' },
                { instruction: 'Đọc to và rõ ràng:', text: 'I go to school by bike. My friend walks with me.' },
                { instruction: 'Đọc chậm và đúng âm:', text: 'We play in the park after school. We are happy.' },
            ];
        }

        return [
            { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'Today is sunny. I wear my yellow hat and play with my dog in the yard.' },
            { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'My family has dinner at seven o’clock. We eat rice, fish, and soup together.' },
            { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'Lan loves books. She reads a short story before she goes to bed.' },
        ];
    }

    if (level === 1) {
        return [
            { instruction: 'Đọc to đoạn ngắn:', text: 'My favorite room is the living room. I watch cartoons there.' },
            { instruction: 'Đọc to đoạn ngắn:', text: 'Every morning, I make my bed and brush my teeth.' },
            { instruction: 'Đọc to đoạn ngắn:', text: 'My sister wears a pink dress and white shoes today.' },
        ];
    }

    if (level === 2) {
        return [
            { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'After school, Minh helps his mother water the plants and feed the chickens.' },
            { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'On Saturday, my family goes to the supermarket and buys fruit, milk, and bread.' },
            { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'There is a big tree behind my house. Birds sing in it every morning.' },
        ];
    }

    return [
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'Last weekend, we visited the zoo. I saw monkeys, elephants, and a very tall giraffe.' },
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'My dream job is to be a teacher because I want to help children learn new things.' },
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'When it rains, I stay inside, read comics, and listen to music with my brother.' },
    ];
}

function getReadingSeeds(skillId: string, level: number): McqSeed[] {
    const isStoryQuest = skillId === 'eng-story-quest';
    const isGrade3 = skillId.startsWith('eng3') || isStoryQuest;

    if (isStoryQuest) {
        if (level === 1) {
            return [
                { text: 'Story: "Tom has a small kite. He flies it in the yard."\n\nQuestion: Where does Tom fly the kite?', options: ['In the yard', 'At school', 'At the beach', 'In the kitchen'], answer: 'In the yard' },
                { text: 'Story: "Linh sees a lost puppy. She takes it to the guard room."\n\nQuestion: What animal does Linh see?', options: ['A kitten', 'A puppy', 'A bird', 'A rabbit'], answer: 'A puppy' },
                { text: 'Story: "Ben buys a storybook and reads it with his sister."\n\nQuestion: What does Ben buy?', options: ['A ruler', 'A storybook', 'A toy car', 'A ball'], answer: 'A storybook' },
            ];
        }

        if (level === 2) {
            return [
                { text: 'Story: "On Sunday, Mai visits her grandmother. She helps water the flowers and then eats lunch there."\n\nQuestion: What does Mai help do?', options: ['Wash the car', 'Water the flowers', 'Cook dinner', 'Clean the window'], answer: 'Water the flowers' },
                { text: 'Story: "Nam forgets his raincoat in class. His friend runs back with him to get it before the rain starts."\n\nQuestion: Why do they go back to class?', options: ['To get a book', 'To get the raincoat', 'To play games', 'To see the teacher'], answer: 'To get the raincoat' },
                { text: 'Story: "The children make fruit salad with apples, bananas, and yogurt. Everyone says it is delicious."\n\nQuestion: What do the children make?', options: ['Soup', 'Fruit salad', 'Rice', 'Sandwiches'], answer: 'Fruit salad' },
            ];
        }

        return [
            { text: 'Story: "Hoa saves ten thousand dong every week because she wants a new backpack. After five weeks, she has enough money and feels very proud."\n\nQuestion: Why does Hoa save money?', options: ['To buy candy', 'To buy a backpack', 'To buy a bike', 'To buy shoes'], answer: 'To buy a backpack' },
            { text: 'Story: "During the class picnic, Minh shares his water with a friend who forgets a bottle. The teacher praises Minh for being kind and thoughtful."\n\nQuestion: Why does the teacher praise Minh?', options: ['He runs fast', 'He sings well', 'He shares his water', 'He brings a ball'], answer: 'He shares his water' },
            { text: 'Story: "Lan reads a notice about the school fair. It says students should arrive at eight o’clock and bring small change for games."\n\nQuestion: What should students bring?', options: ['A big bag', 'Small change', 'A raincoat', 'A pencil case'], answer: 'Small change' },
        ];
    }

    if (!isGrade3) {
        if (level === 1) {
            return [
                { text: 'Read: "I have a cat. It is white."\n\nQuestion: What color is the cat?', options: ['Black', 'Brown', 'White', 'Yellow'], answer: 'White' },
                { text: 'Read: "Tom is in the park."\n\nQuestion: Where is Tom?', options: ['At home', 'At school', 'In the park', 'In the zoo'], answer: 'In the park' },
                { text: 'Read: "My bag is blue."\n\nQuestion: What color is the bag?', options: ['Blue', 'Red', 'Pink', 'Green'], answer: 'Blue' },
            ];
        }

        if (level === 2) {
            return [
                { text: 'Read: "Linh has two books. She reads with her sister."\n\nQuestion: How many books does Linh have?', options: ['One', 'Two', 'Three', 'Four'], answer: 'Two' },
                { text: 'Read: "My father is a driver. He drives a bus."\n\nQuestion: What does he drive?', options: ['A car', 'A bike', 'A bus', 'A train'], answer: 'A bus' },
                { text: 'Read: "It is hot today, so Nam drinks cold water."\n\nQuestion: What does Nam drink?', options: ['Milk', 'Juice', 'Tea', 'Water'], answer: 'Water' },
            ];
        }

        return [
            { text: 'Read: "Mai has a small garden. She waters the flowers every morning."\n\nQuestion: What does Mai water?', options: ['The trees', 'The flowers', 'The grass', 'The vegetables'], answer: 'The flowers' },
            { text: 'Read: "My classroom has twenty desks and one big board."\n\nQuestion: How many desks are there?', options: ['Ten', 'Twelve', 'Twenty', 'Twenty-two'], answer: 'Twenty' },
            { text: 'Read: "I like apples because they are sweet and crunchy."\n\nQuestion: Why do I like apples?', options: ['They are sour', 'They are sweet', 'They are hot', 'They are salty'], answer: 'They are sweet' },
        ];
    }

    if (level === 1) {
        return [
            { text: 'Read: "My brother plays football after school. He is very good."\n\nQuestion: What does he play?', options: ['Basketball', 'Football', 'Chess', 'Badminton'], answer: 'Football' },
            { text: 'Read: "There are three rooms in my house: a bedroom, a kitchen, and a living room."\n\nQuestion: How many rooms are there?', options: ['Two', 'Three', 'Four', 'Five'], answer: 'Three' },
            { text: 'Read: "Lan wears a red skirt and a white T-shirt."\n\nQuestion: What color is her skirt?', options: ['Blue', 'Green', 'White', 'Red'], answer: 'Red' },
        ];
    }

    if (level === 2) {
        return [
            { text: 'Read: "Every Sunday, my family cleans the house and cooks lunch together."\n\nQuestion: What do we do every Sunday?', options: ['Go swimming', 'Clean the house', 'Visit school', 'Play games'], answer: 'Clean the house' },
            { text: 'Read: "Nam gets up at six, exercises for ten minutes, and then eats breakfast."\n\nQuestion: What does Nam do before breakfast?', options: ['He reads', 'He exercises', 'He sleeps', 'He studies'], answer: 'He exercises' },
            { text: 'Read: "My mother buys carrots, tomatoes, and fish at the market."\n\nQuestion: Where does she buy food?', options: ['At the market', 'At school', 'At the park', 'At home'], answer: 'At the market' },
        ];
    }

    return [
        { text: 'Read: "Last Sunday, Minh visited his grandparents. He helped his grandpa water the plants and fed the chickens."\n\nQuestion: Who did Minh visit?', options: ['His teacher', 'His friends', 'His grandparents', 'His cousin'], answer: 'His grandparents' },
        { text: 'Read: "My class has a picnic in the park once a month. We bring food, play games, and sing songs together."\n\nQuestion: Where does the class have a picnic?', options: ['At school', 'In the park', 'At home', 'At the beach'], answer: 'In the park' },
        { text: 'Read: "Hoa wants to save money to buy a new storybook. She puts five thousand dong into her piggy bank every week."\n\nQuestion: Why does Hoa save money?', options: ['To buy a storybook', 'To buy a kite', 'To buy milk', 'To buy shoes'], answer: 'To buy a storybook' },
    ];
}

function getWritingSeeds(skillId: string, level: number): WritingSeed[] {
    const isGrade3 = skillId.startsWith('eng3');

    if (!isGrade3) {
        if (level === 1) {
            return [
                { text: 'Write the word for this color: banana = ?', answer: 'yellow', hint: 'It starts with y.' },
                { text: 'Write one word: A baby cat is a ...', answer: 'kitten', hint: 'It starts with k.' },
                { text: 'Complete the word: b_o_k', answer: 'book', hint: 'It is something you read.' },
            ];
        }

        if (level === 2) {
            return [
                { text: 'Write a short answer: "What is your name?"', answer: 'My name is An.', hint: 'Start with My name is ...' },
                { text: 'Write a short sentence about your favorite color.', answer: 'My favorite color is blue.', hint: 'Use: My favorite color is ...' },
                { text: 'Complete the sentence: "This is my ___." (school bag)', answer: 'bag', hint: 'One word only.' },
            ];
        }

        return [
            { text: 'Write one short sentence about your pet or favorite animal.', answer: 'I like cats.', hint: 'Use a short sentence.' },
            { text: 'Write one short sentence about your school.', answer: 'My school is nice.', hint: 'Use My school ...' },
            { text: 'Write one short sentence about your family.', answer: 'I love my family.', hint: 'Keep it short and simple.' },
        ];
    }

    if (level === 1) {
        return [
            { text: 'Write one sentence about your daily routine.', answer: "I get up at six o'clock.", hint: 'Use I + verb ...' },
            { text: 'Write one sentence about your house.', answer: 'My house has two bedrooms.', hint: 'Use My house ...' },
            { text: 'Write one sentence about your favorite food.', answer: 'I like noodles.', hint: 'Use I like ...' },
        ];
    }

    if (level === 2) {
        return [
            { text: 'Write two short sentences about what you do after school.', answer: 'I go home. I do my homework.', hint: 'Write 2 short sentences.' },
            { text: 'Write two short sentences about your family.', answer: 'My family is small. We are happy.', hint: 'Write 2 short sentences.' },
            { text: 'Write two short sentences about your room.', answer: 'My room is tidy. It has a desk.', hint: 'Write 2 short sentences.' },
        ];
    }

    return [
        { text: 'Write 2-3 short sentences about your weekend.', answer: 'I visit my grandparents. We eat lunch together.', hint: 'Keep the sentences short.' },
        { text: 'Write 2-3 short sentences about your favorite place.', answer: 'I like the park. It is green and quiet.', hint: 'Keep it simple.' },
        { text: 'Write 2-3 short sentences about how you save money.', answer: 'I save money in my piggy bank. I do not buy snacks every day.', hint: 'Write short ideas only.' },
    ];
}

export function generateEnglishListeningQuestion(skillId: string, level: number = 1): Question {
    const item = pickRandom(getListeningSeeds(skillId, getBalancedEnglishLevel(skillId, level)));
    return {
        id: `eng-list-${Date.now()}`,
        subjectId: 'english',
        skillId,
        type: 'listening',
        instruction: 'Nghe kỹ và chọn đáp án đúng nhất:',
        content: {
            text: item.text,
            options: item.options,
            audio: item.text,
        },
        answer: item.answer,
    };
}

export function generateEnglishSpeakingQuestion(skillId: string, level: number = 1): Question {
    const item = pickRandom(getReadAloudSeeds(skillId, getBalancedEnglishLevel(skillId, level)));
    return {
        id: `eng-speak-${Date.now()}`,
        subjectId: 'english',
        skillId,
        type: 'reading',
        instruction: item.instruction,
        content: {
            text: item.text,
        },
        answer: 'Đã đọc',
    };
}

export function generateEnglishReadingQuestion(skillId: string, level: number = 1): Question {
    const item = pickRandom(getReadingSeeds(skillId, getBalancedEnglishLevel(skillId, level)));
    return {
        id: `eng-read-${Date.now()}`,
        subjectId: 'english',
        skillId,
        type: 'mcq',
        instruction: 'Đọc và trả lời câu hỏi:',
        content: {
            text: item.text,
            options: item.options,
        },
        answer: item.answer,
        explanation: 'Đáp án nằm trong đoạn đọc.',
    };
}

export function generateEnglishWritingQuestion(skillId: string, level: number = 1): Question {
    const item = pickRandom(getWritingSeeds(skillId, getBalancedEnglishLevel(skillId, level)));
    return {
        id: `eng-write-${Date.now()}`,
        subjectId: 'english',
        skillId,
        type: 'input',
        instruction: 'Viết câu trả lời ngắn:',
        content: {
            text: item.text,
        },
        answer: item.answer,
        hint: item.hint,
    };
}
