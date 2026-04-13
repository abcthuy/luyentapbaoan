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

type CoreSeed = {
    instruction: string;
    text: string;
    options: string[];
    answer: string;
    hint?: string;
};

const EXTRA_LISTENING_SEEDS: Record<string, McqSeed[]> = {
    'eng2-list-1': [
        { text: 'I have one ruler and one pen.', options: ['Ruler', 'Pencil', 'Bag', 'Desk'], answer: 'Ruler' },
        { text: 'The apple is green.', options: ['Red', 'Blue', 'Green', 'Black'], answer: 'Green' },
        { text: 'She likes orange juice.', options: ['Milk', 'Tea', 'Orange juice', 'Water'], answer: 'Orange juice' },
    ],
    'eng2-list-2': [
        { text: 'The shoes are under the bed.', options: ['On the bed', 'Under the bed', 'Near the desk', 'In the box'], answer: 'Under the bed' },
        { text: 'My brother has three toy cars.', options: ['Two', 'Three', 'Four', 'Five'], answer: 'Three' },
        { text: 'The girl is in the kitchen with her mother.', options: ['Kitchen', 'Bedroom', 'Garden', 'Library'], answer: 'Kitchen' },
    ],
    'eng2-list-3': [
        { text: 'It is rainy today, so I stay inside and read a book.', options: ['Play outside', 'Read a book', 'Ride a bike', 'Go swimming'], answer: 'Read a book' },
        { text: 'My grandpa drinks hot tea in the morning.', options: ['Milk', 'Coffee', 'Tea', 'Juice'], answer: 'Tea' },
        { text: 'The children stand in a line before class.', options: ['Stand in a line', 'Eat lunch', 'Play football', 'Go home'], answer: 'Stand in a line' },
    ],
    'eng3-list-1': [
        { text: 'My cousin studies English on Monday and Wednesday.', options: ['Monday and Wednesday', 'Tuesday and Thursday', 'Saturday and Sunday', 'Every day'], answer: 'Monday and Wednesday' },
        { text: 'There is a lamp next to the bed and a clock on the wall.', options: ['A lamp', 'A sofa', 'A fridge', 'A fan'], answer: 'A lamp' },
        { text: 'The students sing a song before the English lesson starts.', options: ['Read a story', 'Sing a song', 'Draw a picture', 'Write a letter'], answer: 'Sing a song' },
    ],
    'eng3-list-2': [
        { text: 'Mai washes the dishes after dinner and then prepares her books for school.', options: ['After lunch', 'After dinner', 'Before breakfast', 'At noon'], answer: 'After dinner' },
        { text: 'The zoo is far from our house, so we go there by car.', options: ['By bus', 'By bike', 'By car', 'On foot'], answer: 'By car' },
        { text: 'At the school fair, I buy a notebook because it is useful.', options: ['A toy robot', 'A notebook', 'A cake', 'A kite'], answer: 'A notebook' },
    ],
    'eng3-list-3': [
        { text: 'My sister wants to be a doctor because she likes helping sick people.', options: ['A nurse', 'A doctor', 'A teacher', 'A singer'], answer: 'A doctor' },
        { text: 'We take photos near the river and have sandwiches for lunch.', options: ['Noodles', 'Rice', 'Sandwiches', 'Soup'], answer: 'Sandwiches' },
        { text: 'Because the test is tomorrow, Nam reviews his notes and goes to bed early.', options: ['Plays video games', 'Goes shopping', 'Reviews his notes', 'Visits his friend'], answer: 'Reviews his notes' },
    ],
};

const EXTRA_READ_ALOUD_SEEDS: Record<string, PassageSeed[]> = {
    'eng2-speak-1': [
        { instruction: 'Đọc to câu sau:', text: 'This is my happy family.' },
        { instruction: 'Đọc to câu sau:', text: 'I see a big yellow sun.' },
        { instruction: 'Đọc to câu sau:', text: 'My friend has a small dog.' },
    ],
    'eng2-speak-2': [
        { instruction: 'Đọc rõ từng câu:', text: 'I go to school at seven. I carry a blue bag.' },
        { instruction: 'Đọc to và đúng âm:', text: 'My brother likes milk. He drinks it every day.' },
        { instruction: 'Đọc rõ từng câu:', text: 'The bird is in the tree. It sings in the morning.' },
    ],
    'eng2-speak-3': [
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'It is a beautiful day. We play in the garden and laugh together.' },
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'My classroom is clean and bright. I feel happy when I study there.' },
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'After dinner, I help my mother and listen to a bedtime story.' },
    ],
    'eng3-speak-1': [
        { instruction: 'Đọc to đoạn ngắn:', text: 'I usually get up early, brush my teeth, and help my mother set the table.' },
        { instruction: 'Đọc to đoạn ngắn:', text: 'My favorite subject is English because I like songs, stories, and new words.' },
        { instruction: 'Đọc to đoạn ngắn:', text: 'There is a small garden behind my house with flowers and two tall trees.' },
    ],
    'eng3-speak-2': [
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'On rainy days, I stay at home, finish my homework, and play board games with my brother.' },
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'Every Saturday, my father takes me to the library, and I choose two new books to read.' },
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'Our class plants flowers in the school garden, waters them carefully, and watches them grow.' },
    ],
    'eng3-speak-3': [
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'In the future, I want to visit many places, meet kind people, and learn new things.' },
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'When we work together in class, we can help each other and finish faster.' },
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'Good habits are important because they make us strong and ready to learn every day.' },
    ],
};

const EXTRA_READING_SEEDS: Record<string, McqSeed[]> = {
    'eng-story-quest-1': [
        { text: 'Story: "Lucy finds a coin near the school gate. She gives it to the teacher."\n\nQuestion: Who does Lucy give the coin to?', options: ['Her mother', 'The teacher', 'Her friend', 'The guard'], answer: 'The teacher' },
        { text: 'Story: "Peter packs a sandwich, an apple, and water for the trip."\n\nQuestion: What fruit does Peter pack?', options: ['A banana', 'An orange', 'An apple', 'A mango'], answer: 'An apple' },
        { text: 'Story: "At the beach, Ben builds a sandcastle with his little sister."\n\nQuestion: What do they build?', options: ['A boat', 'A sandcastle', 'A kite', 'A tent'], answer: 'A sandcastle' },
    ],
    'eng-story-quest-2': [
        { text: 'Story: "The class visits a cake shop. The baker shows them how to make bread and cakes."\n\nQuestion: Where does the class go?', options: ['A library', 'A cake shop', 'A hospital', 'A farm'], answer: 'A cake shop' },
        { text: 'Story: "Nina studies hard for the spelling contest. She practices ten new words every evening."\n\nQuestion: What does Nina practice?', options: ['Songs', 'New words', 'Pictures', 'Games'], answer: 'New words' },
        { text: 'Story: "Because the bus is late, the children read signs and count cars while they wait."\n\nQuestion: Why do the children wait?', options: ['The bus is late', 'The class is over', 'It is raining', 'They are tired'], answer: 'The bus is late' },
    ],
    'eng-story-quest-3': [
        { text: 'Story: "The school team makes a poster about clean water. They draw rivers and write simple rules."\n\nQuestion: What do they make?', options: ['A model car', 'A poster', 'A cake', 'A song'], answer: 'A poster' },
        { text: 'Story: "Emma saves her pocket money for two months to buy a new English book. She reads it every night."\n\nQuestion: What does Emma buy?', options: ['A notebook', 'An English book', 'A puzzle', 'A doll'], answer: 'An English book' },
        { text: 'Story: "At the book fair, Tony chooses a comic for himself and a picture book for his little brother."\n\nQuestion: Who gets the picture book?', options: ['Tony', 'His friend', 'His little brother', 'His teacher'], answer: 'His little brother' },
    ],
    'eng2-read-1': [
        { text: 'Read: "This is my pencil case. It is green."\n\nQuestion: What color is the pencil case?', options: ['Red', 'Blue', 'Green', 'Pink'], answer: 'Green' },
        { text: 'Read: "The fish is in the bowl."\n\nQuestion: Where is the fish?', options: ['In the box', 'In the bowl', 'On the bed', 'Under the chair'], answer: 'In the bowl' },
        { text: 'Read: "I have one brother and one sister."\n\nQuestion: How many sisters do I have?', options: ['One', 'Two', 'Three', 'Four'], answer: 'One' },
    ],
    'eng2-read-2': [
        { text: 'Read: "Sam has a kite and a ball. He plays in the yard."\n\nQuestion: Where does Sam play?', options: ['At school', 'In the yard', 'In the kitchen', 'In the park'], answer: 'In the yard' },
        { text: 'Read: "My mother cooks rice and chicken for lunch."\n\nQuestion: What does my mother cook?', options: ['Bread and milk', 'Rice and chicken', 'Noodles and fish', 'Soup and eggs'], answer: 'Rice and chicken' },
        { text: 'Read: "It is cold today, so I wear a warm coat."\n\nQuestion: What do I wear?', options: ['A hat', 'A coat', 'A skirt', 'A scarf'], answer: 'A coat' },
    ],
    'eng2-read-3': [
        { text: 'Read: "After school, I tidy my desk and help my father water the plants."\n\nQuestion: What do I help water?', options: ['The flowers', 'The plants', 'The trees', 'The grass'], answer: 'The plants' },
        { text: 'Read: "My best friend is kind and always shares her crayons with me."\n\nQuestion: What does my friend share?', options: ['Books', 'Crayons', 'Apples', 'Shoes'], answer: 'Crayons' },
        { text: 'Read: "The baby sleeps in the afternoon, but he plays in the evening."\n\nQuestion: When does the baby sleep?', options: ['In the morning', 'At noon', 'In the afternoon', 'At night'], answer: 'In the afternoon' },
    ],
    'eng3-read-1': [
        { text: 'Read: "My aunt works in a cake shop. She makes bread and cakes every morning."\n\nQuestion: What does my aunt make?', options: ['Soup and rice', 'Bread and cakes', 'Pizza and milk', 'Salad and fish'], answer: 'Bread and cakes' },
        { text: 'Read: "There is a map on the wall and a computer on the teacher\'s desk."\n\nQuestion: Where is the computer?', options: ['On the wall', 'On the teacher\'s desk', 'Under the chair', 'Near the door'], answer: 'On the teacher\'s desk' },
        { text: 'Read: "We have English on Tuesday and Music on Friday."\n\nQuestion: When do we have Music?', options: ['On Monday', 'On Tuesday', 'On Thursday', 'On Friday'], answer: 'On Friday' },
    ],
    'eng3-read-2': [
        { text: 'Read: "After doing his homework, Jack helps his little sister read a short story."\n\nQuestion: Who does Jack help?', options: ['His brother', 'His cousin', 'His little sister', 'His teacher'], answer: 'His little sister' },
        { text: 'Read: "The zoo opens at nine o\'clock, so we leave home at half past eight."\n\nQuestion: When do we leave home?', options: ['At eight', 'At half past eight', 'At nine', 'At half past nine'], answer: 'At half past eight' },
        { text: 'Read: "My grandfather likes growing flowers because it keeps him busy and happy."\n\nQuestion: Why does my grandfather like growing flowers?', options: ['It is easy', 'It keeps him busy and happy', 'He sells them', 'He eats them at school'], answer: 'It keeps him busy and happy' },
    ],
    'eng3-read-3': [
        { text: 'Read: "During the camping trip, we learned how to set up a tent and cook noodles on a small stove."\n\nQuestion: What did we learn to set up?', options: ['A tent', 'A table', 'A house', 'A kite'], answer: 'A tent' },
        { text: 'Read: "Lily wants to be better at English, so she listens to songs, reads comics, and practices speaking every day."\n\nQuestion: Why does Lily practice every day?', options: ['To be better at English', 'To win a race', 'To clean her room', 'To visit a friend'], answer: 'To be better at English' },
        { text: 'Read: "The school library is my favorite place because it is quiet, bright, and full of interesting books."\n\nQuestion: Why is the library my favorite place?', options: ['It is noisy', 'It is bright and full of books', 'It is small', 'It is near the canteen'], answer: 'It is bright and full of books' },
    ],
};

const EXTRA_WRITING_SEEDS: Record<string, WritingSeed[]> = {
    'eng2-write-1': [
        { text: 'Write the missing word: The sky is ____.', answer: 'blue', hint: 'It is a color.' },
        { text: 'Write one word: A baby dog is a ____.', answer: 'puppy', hint: 'It starts with p.' },
        { text: 'Complete the word: a_p_e', answer: 'apple', hint: 'It is a fruit.' },
    ],
    'eng2-write-2': [
        { text: 'Write a short answer: "How old are you?"', answer: 'I am eight years old.', hint: 'Use: I am ... years old.' },
        { text: 'Write one short sentence about your teacher.', answer: 'My teacher is kind.', hint: 'Use My teacher ...' },
        { text: 'Complete the sentence: "I go to school by ___."', answer: 'bike', hint: 'One word only.' },
    ],
    'eng2-write-3': [
        { text: 'Write one short sentence about your favorite toy.', answer: 'My favorite toy is a robot.', hint: 'Use My favorite toy is ...' },
        { text: 'Write one short sentence about today\'s weather.', answer: 'It is sunny today.', hint: 'Use It is ... today.' },
        { text: 'Write one short sentence about your best friend.', answer: 'My best friend is funny.', hint: 'Use My best friend ...' },
    ],
    'eng3-write-1': [
        { text: 'Write one sentence about what you do in the morning.', answer: 'I wash my face and eat breakfast.', hint: 'Use I + verb ...' },
        { text: 'Write one sentence about your classroom.', answer: 'My classroom has many pictures.', hint: 'Use My classroom ...' },
        { text: 'Write one sentence about your favorite sport.', answer: 'I like badminton.', hint: 'Use I like ...' },
    ],
    'eng3-write-2': [
        { text: 'Write two short sentences about your weekend activities.', answer: 'I visit my grandparents. We eat lunch together.', hint: 'Write 2 short sentences.' },
        { text: 'Write two short sentences about your favorite subject.', answer: 'I like English. It is fun.', hint: 'Write 2 short sentences.' },
        { text: 'Write two short sentences about your pet or favorite animal.', answer: 'I like rabbits. They are cute and gentle.', hint: 'Write 2 short sentences.' },
    ],
    'eng3-write-3': [
        { text: 'Write 2-3 short sentences about how you help at home.', answer: 'I sweep the floor and water the plants. My mother is happy.', hint: 'Keep the sentences short.' },
        { text: 'Write 2-3 short sentences about a school trip you want to have.', answer: 'I want to visit the zoo with my class. We can see many animals there.', hint: 'Write short ideas only.' },
        { text: 'Write 2-3 short sentences about why exercise is good.', answer: 'Exercise makes us strong and healthy. It helps us feel happy.', hint: 'Write short ideas only.' },
    ],
};

const ENGLISH_CORE_SEEDS: Record<string, CoreSeed[]> = {
    'eng-clothes': [
        { instruction: 'Choose the correct answer:', text: 'What do you wear on your feet?', options: ['Hat', 'Shoes', 'Shirt', 'Cap'], answer: 'Shoes' },
        { instruction: 'Choose the correct answer:', text: 'A dress, a skirt, and a T-shirt are all ...', options: ['food', 'clothes', 'rooms', 'animals'], answer: 'clothes' },
        { instruction: 'Choose the correct answer:', text: 'Which item can keep you warm when it is cold?', options: ['Coat', 'Spoon', 'Book', 'Lamp'], answer: 'Coat' },
    ],
    'eng-food': [
        { instruction: 'Choose the correct answer:', text: 'Which one is a drink?', options: ['Rice', 'Milk', 'Chicken', 'Bread'], answer: 'Milk' },
        { instruction: 'Choose the correct answer:', text: 'We usually eat soup with a ...', options: ['Spoon', 'Pencil', 'Ball', 'Brush'], answer: 'Spoon' },
        { instruction: 'Choose the correct answer:', text: 'Apples and bananas are ...', options: ['vegetables', 'drinks', 'fruits', 'toys'], answer: 'fruits' },
    ],
    'eng-routine': [
        { instruction: 'Choose the correct answer:', text: 'What do you usually do after you wake up?', options: ['Brush my teeth', 'Go to bed', 'Eat dinner', 'Take a bus home'], answer: 'Brush my teeth' },
        { instruction: 'Choose the correct answer:', text: 'Which activity often happens in the evening?', options: ['Have breakfast', 'Do homework', 'Wake up', 'Go to school'], answer: 'Do homework' },
        { instruction: 'Choose the correct answer:', text: 'A daily routine is something you do ...', options: ['every day', 'once a year', 'only on Sunday', 'when you are asleep'], answer: 'every day' },
    ],
    'eng-house': [
        { instruction: 'Choose the correct answer:', text: 'You sleep in the ...', options: ['bedroom', 'kitchen', 'garden', 'bathroom'], answer: 'bedroom' },
        { instruction: 'Choose the correct answer:', text: 'We cook meals in the ...', options: ['living room', 'kitchen', 'yard', 'hall'], answer: 'kitchen' },
        { instruction: 'Choose the correct answer:', text: 'A sofa is usually in the ...', options: ['bedroom', 'living room', 'garage', 'school'], answer: 'living room' },
    ],
    'eng-vowels': [
        { instruction: 'Choose the correct answer:', text: 'Which word has the short /a/ sound?', options: ['cat', 'bike', 'note', 'cube'], answer: 'cat' },
        { instruction: 'Choose the correct answer:', text: 'Which word has the short /e/ sound?', options: ['bed', 'kite', 'rope', 'tube'], answer: 'bed' },
        { instruction: 'Choose the correct answer:', text: 'Which word has the short /o/ sound?', options: ['dog', 'cake', 'five', 'music'], answer: 'dog' },
    ],
    'eng-blends': [
        { instruction: 'Choose the correct answer:', text: 'Which word begins with the blend "bl"?', options: ['black', 'clock', 'green', 'smile'], answer: 'black' },
        { instruction: 'Choose the correct answer:', text: 'Which word begins with the blend "cr"?', options: ['tree', 'crab', 'ship', 'plate'], answer: 'crab' },
        { instruction: 'Choose the correct answer:', text: 'Which word begins with the blend "st"?', options: ['star', 'chair', 'grape', 'dress'], answer: 'star' },
    ],
    'eng-grammar-present': [
        { instruction: 'Choose the correct answer:', text: 'Nam ... to school every day.', options: ['go', 'goes', 'going', 'went'], answer: 'goes' },
        { instruction: 'Choose the correct answer:', text: 'I ... milk in the morning.', options: ['drinks', 'drink', 'drinking', 'drank'], answer: 'drink' },
        { instruction: 'Choose the correct answer:', text: 'She ... her homework after school.', options: ['do', 'does', 'did', 'doing'], answer: 'does' },
    ],
    'eng-grammar-continuous': [
        { instruction: 'Choose the correct answer:', text: 'Look! The boys ... football now.', options: ['play', 'are playing', 'plays', 'played'], answer: 'are playing' },
        { instruction: 'Choose the correct answer:', text: 'My mother is ... dinner in the kitchen.', options: ['cook', 'cooks', 'cooking', 'cooked'], answer: 'cooking' },
        { instruction: 'Choose the correct answer:', text: 'Listen! The baby ...', options: ['crying', 'is crying', 'cries', 'cry'], answer: 'is crying' },
    ],
    'eng-prepositions': [
        { instruction: 'Choose the correct answer:', text: 'The cat is ... the table.', options: ['under', 'eat', 'run', 'happy'], answer: 'under' },
        { instruction: 'Choose the correct answer:', text: 'The book is ... the desk.', options: ['on', 'jump', 'small', 'sing'], answer: 'on' },
        { instruction: 'Choose the correct answer:', text: 'The ball is ... the box.', options: ['in', 'walk', 'green', 'clap'], answer: 'in' },
    ],
};

function pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

function clampLevel(level: number) {
    return Math.max(1, Math.min(3, Math.round(level || 1)));
}

function getEnglishGradeBand(skillId: string) {
    if (skillId.startsWith('eng2-')) return 2;
    if (skillId.startsWith('eng3-') || skillId === 'eng-story-quest') return 3;
    if (skillId.startsWith('eng4-')) return 4;
    if (skillId.startsWith('eng5-')) return 5;
    return 3;
}

function getBalancedEnglishLevel(skillId: string, level: number) {
    const safeLevel = clampLevel(level);
    const gradeBand = getEnglishGradeBand(skillId);

    if (gradeBand === 2) {
        return 1;
    }

    if (skillId === 'eng-story-quest') {
        return Math.min(safeLevel, 2);
    }

    if (gradeBand === 3) {
        return Math.min(safeLevel, 2);
    }

    if (gradeBand === 4) {
        return Math.min(Math.max(safeLevel, 2), 3);
    }

    return 3;
}

function getListeningSeeds(skillId: string, level: number): McqSeed[] {
    const isGrade2 = getEnglishGradeBand(skillId) === 2;

    if (isGrade2) {
        if (level === 1) {
            return [
                { text: 'I see a red ball.', options: ['Ball', 'Book', 'Bag', 'Pen'], answer: 'Ball' },
                { text: 'Two cats are here.', options: ['One', 'Two', 'Three', 'Four'], answer: 'Two' },
                { text: 'This is my blue bag.', options: ['Blue', 'Green', 'Black', 'Pink'], answer: 'Blue' },
                { text: 'I drink milk.', options: ['Milk', 'Tea', 'Soup', 'Juice'], answer: 'Milk' },
                ...EXTRA_LISTENING_SEEDS['eng2-list-1'],
            ];
        }

        if (level === 2) {
            return [
                { text: 'The boy is under the table.', options: ['Under the table', 'On the chair', 'In the box', 'At the door'], answer: 'Under the table' },
                { text: 'My mother goes to work by bus.', options: ['By bike', 'By bus', 'On foot', 'By train'], answer: 'By bus' },
                { text: 'There are five books on the desk.', options: ['Three', 'Four', 'Five', 'Six'], answer: 'Five' },
                { text: 'Lan has a doll and a kite.', options: ['A kite', 'A pencil', 'A ruler', 'A cake'], answer: 'A kite' },
                ...EXTRA_LISTENING_SEEDS['eng2-list-2'],
            ];
        }

        return [
            { text: 'It is rainy today, so I take my umbrella to school.', options: ['Umbrella', 'Hat', 'Shoes', 'Notebook'], answer: 'Umbrella' },
            { text: 'My father cooks noodles, eggs, and soup for dinner.', options: ['Rice', 'Soup', 'Fish', 'Bread'], answer: 'Soup' },
            { text: 'The library is next to the classroom and near the yard.', options: ['Near the yard', 'In the house', 'On the bus', 'At the zoo'], answer: 'Near the yard' },
            { text: 'Mai gets up at six o\'clock and brushes her teeth first.', options: ['At five', 'At six', 'At seven', 'At eight'], answer: 'At six' },
            ...EXTRA_LISTENING_SEEDS['eng2-list-3'],
        ];
    }

    if (level === 1) {
        return [
            { text: 'My favorite subject is English.', options: ['Math', 'English', 'Art', 'Music'], answer: 'English' },
            { text: 'We play badminton after school.', options: ['Badminton', 'Chess', 'Hide-and-seek', 'Marbles'], answer: 'Badminton' },
            { text: 'There is a sofa in the living room.', options: ['Kitchen', 'Living room', 'Bathroom', 'Garden'], answer: 'Living room' },
            { text: 'The dress is yellow and pretty.', options: ['Yellow', 'Blue', 'Red', 'White'], answer: 'Yellow' },
            ...EXTRA_LISTENING_SEEDS['eng3-list-1'],
        ];
    }

    if (level === 2) {
        return [
            { text: 'Nam has breakfast at seven and goes to school at half past seven.', options: ['At six', 'At seven', 'At eight', 'At nine'], answer: 'At seven' },
            { text: 'My little sister likes chicken and orange juice for lunch.', options: ['Milk', 'Orange juice', 'Tea', 'Water'], answer: 'Orange juice' },
            { text: 'There are two bedrooms upstairs and one kitchen downstairs.', options: ['One bedroom', 'Two bedrooms', 'Three bedrooms', 'Four bedrooms'], answer: 'Two bedrooms' },
            { text: 'The children are flying kites because the weather is windy and cool.', options: ['Rainy', 'Windy', 'Snowy', 'Hot'], answer: 'Windy' },
            ...EXTRA_LISTENING_SEEDS['eng3-list-2'],
        ];
    }

    return [
        { text: 'On Sunday, my family visits my grandparents and we have lunch together.', options: ['On Friday', 'On Saturday', 'On Sunday', 'On Monday'], answer: 'On Sunday' },
        { text: 'The robot in the toy shop is expensive, but the small car is cheaper.', options: ['The robot', 'The small car', 'The kite', 'The ball'], answer: 'The small car' },
        { text: 'Linh waters the plants, feeds the fish, and cleans her desk every afternoon.', options: ['In the morning', 'At noon', 'Every afternoon', 'At night'], answer: 'Every afternoon' },
        { text: 'My uncle works in a hospital, so he often helps sick people.', options: ['At a school', 'At a farm', 'At a hospital', 'At a store'], answer: 'At a hospital' },
        ...EXTRA_LISTENING_SEEDS['eng3-list-3'],
    ];
}

function getReadAloudSeeds(skillId: string, level: number): PassageSeed[] {
    const isGrade2 = getEnglishGradeBand(skillId) === 2;

    if (isGrade2) {
        if (level === 1) {
            return [
                { instruction: 'Đọc to câu sau:', text: 'Hello. My name is Ben.' },
                { instruction: 'Đọc to câu sau:', text: 'I have two red books.' },
                { instruction: 'Đọc to câu sau:', text: 'The cat is on the chair.' },
                ...EXTRA_READ_ALOUD_SEEDS['eng2-speak-1'],
            ];
        }

        if (level === 2) {
            return [
                { instruction: 'Đọc rõ từng câu:', text: 'My house is small. It has a blue door.' },
                { instruction: 'Đọc to và rõ ràng:', text: 'I go to school by bike. My friend walks with me.' },
                { instruction: 'Đọc chậm và đúng âm:', text: 'We play in the park after school. We are happy.' },
                ...EXTRA_READ_ALOUD_SEEDS['eng2-speak-2'],
            ];
        }

        return [
            { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'Today is sunny. I wear my yellow hat and play with my dog in the yard.' },
            { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'My family has dinner at seven o\'clock. We eat rice, fish, and soup together.' },
            { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'Lan loves books. She reads a short story before she goes to bed.' },
            ...EXTRA_READ_ALOUD_SEEDS['eng2-speak-3'],
        ];
    }

    if (level === 1) {
        return [
            { instruction: 'Đọc to đoạn ngắn:', text: 'My favorite room is the living room. I watch cartoons there.' },
            { instruction: 'Đọc to đoạn ngắn:', text: 'Every morning, I make my bed and brush my teeth.' },
            { instruction: 'Đọc to đoạn ngắn:', text: 'My sister wears a pink dress and white shoes today.' },
            ...EXTRA_READ_ALOUD_SEEDS['eng3-speak-1'],
        ];
    }

    if (level === 2) {
        return [
            { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'After school, Minh helps his mother water the plants and feed the chickens.' },
            { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'On Saturday, my family goes to the supermarket and buys fruit, milk, and bread.' },
            { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'There is a big tree behind my house. Birds sing in it every morning.' },
            ...EXTRA_READ_ALOUD_SEEDS['eng3-speak-2'],
        ];
    }

    return [
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'Last weekend, we visited the zoo. I saw monkeys, elephants, and a very tall giraffe.' },
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'My dream job is to be a teacher because I want to help children learn new things.' },
        { instruction: 'Đọc diễn cảm đoạn ngắn:', text: 'When it rains, I stay inside, read comics, and listen to music with my brother.' },
        ...EXTRA_READ_ALOUD_SEEDS['eng3-speak-3'],
    ];
}

function getReadingSeeds(skillId: string, level: number): McqSeed[] {
    const isStoryQuest = skillId === 'eng-story-quest';
    const isGrade2 = getEnglishGradeBand(skillId) === 2;

    if (isStoryQuest) {
        if (level === 1) {
            return [
                { text: 'Story: "Tom has a small kite. He flies it in the yard."\n\nQuestion: Where does Tom fly the kite?', options: ['In the yard', 'At school', 'At the beach', 'In the kitchen'], answer: 'In the yard' },
                { text: 'Story: "Linh sees a lost puppy. She takes it to the guard room."\n\nQuestion: What animal does Linh see?', options: ['A kitten', 'A puppy', 'A bird', 'A rabbit'], answer: 'A puppy' },
                { text: 'Story: "Ben buys a storybook and reads it with his sister."\n\nQuestion: What does Ben buy?', options: ['A ruler', 'A storybook', 'A toy car', 'A ball'], answer: 'A storybook' },
                ...EXTRA_READING_SEEDS['eng-story-quest-1'],
            ];
        }

        if (level === 2) {
            return [
                { text: 'Story: "On Sunday, Mai visits her grandmother. She helps water the flowers and then eats lunch there."\n\nQuestion: What does Mai help do?', options: ['Wash the car', 'Water the flowers', 'Cook dinner', 'Clean the window'], answer: 'Water the flowers' },
                { text: 'Story: "Nam forgets his raincoat in class. His friend runs back with him to get it before the rain starts."\n\nQuestion: Why do they go back to class?', options: ['To get a book', 'To get the raincoat', 'To play games', 'To see the teacher'], answer: 'To get the raincoat' },
                { text: 'Story: "The children make fruit salad with apples, bananas, and yogurt. Everyone says it is delicious."\n\nQuestion: What do the children make?', options: ['Soup', 'Fruit salad', 'Rice', 'Sandwiches'], answer: 'Fruit salad' },
                ...EXTRA_READING_SEEDS['eng-story-quest-2'],
            ];
        }

        return [
            { text: 'Story: "Hoa saves ten thousand dong every week because she wants a new backpack. After five weeks, she has enough money and feels very proud."\n\nQuestion: Why does Hoa save money?', options: ['To buy candy', 'To buy a backpack', 'To buy a bike', 'To buy shoes'], answer: 'To buy a backpack' },
            { text: 'Story: "During the class picnic, Minh shares his water with a friend who forgets a bottle. The teacher praises Minh for being kind and thoughtful."\n\nQuestion: Why does the teacher praise Minh?', options: ['He runs fast', 'He sings well', 'He shares his water', 'He brings a ball'], answer: 'He shares his water' },
            { text: 'Story: "Lan reads a notice about the school fair. It says students should arrive at eight o\'clock and bring small change for games."\n\nQuestion: What should students bring?', options: ['A big bag', 'Small change', 'A raincoat', 'A pencil case'], answer: 'Small change' },
            ...EXTRA_READING_SEEDS['eng-story-quest-3'],
        ];
    }

    if (isGrade2) {
        if (level === 1) {
            return [
                { text: 'Read: "I have a cat. It is white."\n\nQuestion: What color is the cat?', options: ['Black', 'Brown', 'White', 'Yellow'], answer: 'White' },
                { text: 'Read: "Tom is in the park."\n\nQuestion: Where is Tom?', options: ['At home', 'At school', 'In the park', 'In the zoo'], answer: 'In the park' },
                { text: 'Read: "My bag is blue."\n\nQuestion: What color is the bag?', options: ['Blue', 'Red', 'Pink', 'Green'], answer: 'Blue' },
                ...EXTRA_READING_SEEDS['eng2-read-1'],
            ];
        }

        if (level === 2) {
            return [
                { text: 'Read: "Linh has two books. She reads with her sister."\n\nQuestion: How many books does Linh have?', options: ['One', 'Two', 'Three', 'Four'], answer: 'Two' },
                { text: 'Read: "My father is a driver. He drives a bus."\n\nQuestion: What does he drive?', options: ['A car', 'A bike', 'A bus', 'A train'], answer: 'A bus' },
                { text: 'Read: "It is hot today, so Nam drinks cold water."\n\nQuestion: What does Nam drink?', options: ['Milk', 'Juice', 'Tea', 'Water'], answer: 'Water' },
                ...EXTRA_READING_SEEDS['eng2-read-2'],
            ];
        }

        return [
            { text: 'Read: "Mai has a small garden. She waters the flowers every morning."\n\nQuestion: What does Mai water?', options: ['The trees', 'The flowers', 'The grass', 'The vegetables'], answer: 'The flowers' },
            { text: 'Read: "My classroom has twenty desks and one big board."\n\nQuestion: How many desks are there?', options: ['Ten', 'Twelve', 'Twenty', 'Twenty-two'], answer: 'Twenty' },
            { text: 'Read: "I like apples because they are sweet and crunchy."\n\nQuestion: Why do I like apples?', options: ['They are sour', 'They are sweet', 'They are hot', 'They are salty'], answer: 'They are sweet' },
            ...EXTRA_READING_SEEDS['eng2-read-3'],
        ];
    }

    if (level === 1) {
        return [
            { text: 'Read: "My brother plays football after school. He is very good."\n\nQuestion: What does he play?', options: ['Basketball', 'Football', 'Chess', 'Badminton'], answer: 'Football' },
            { text: 'Read: "There are three rooms in my house: a bedroom, a kitchen, and a living room."\n\nQuestion: How many rooms are there?', options: ['Two', 'Three', 'Four', 'Five'], answer: 'Three' },
            { text: 'Read: "Lan wears a red skirt and a white T-shirt."\n\nQuestion: What color is her skirt?', options: ['Blue', 'Green', 'White', 'Red'], answer: 'Red' },
            ...EXTRA_READING_SEEDS['eng3-read-1'],
        ];
    }

    if (level === 2) {
        return [
            { text: 'Read: "Every Sunday, my family cleans the house and cooks lunch together."\n\nQuestion: What do we do every Sunday?', options: ['Go swimming', 'Clean the house', 'Visit school', 'Play games'], answer: 'Clean the house' },
            { text: 'Read: "Nam gets up at six, exercises for ten minutes, and then eats breakfast."\n\nQuestion: What does Nam do before breakfast?', options: ['He reads', 'He exercises', 'He sleeps', 'He studies'], answer: 'He exercises' },
            { text: 'Read: "My mother buys carrots, tomatoes, and fish at the market."\n\nQuestion: Where does she buy food?', options: ['At the market', 'At school', 'At the park', 'At home'], answer: 'At the market' },
            ...EXTRA_READING_SEEDS['eng3-read-2'],
        ];
    }

    return [
        { text: 'Read: "Last Sunday, Minh visited his grandparents. He helped his grandpa water the plants and fed the chickens."\n\nQuestion: Who did Minh visit?', options: ['His teacher', 'His friends', 'His grandparents', 'His cousin'], answer: 'His grandparents' },
        { text: 'Read: "My class has a picnic in the park once a month. We bring food, play games, and sing songs together."\n\nQuestion: Where does the class have a picnic?', options: ['At school', 'In the park', 'At home', 'At the beach'], answer: 'In the park' },
        { text: 'Read: "Hoa wants to save money to buy a new storybook. She puts five thousand dong into her piggy bank every week."\n\nQuestion: Why does Hoa save money?', options: ['To buy a storybook', 'To buy a kite', 'To buy milk', 'To buy shoes'], answer: 'To buy a storybook' },
        ...EXTRA_READING_SEEDS['eng3-read-3'],
    ];
}

function getWritingSeeds(skillId: string, level: number): WritingSeed[] {
    const isGrade2 = getEnglishGradeBand(skillId) === 2;

    if (isGrade2) {
        if (level === 1) {
            return [
                { text: 'Write the word for this color: banana = ?', answer: 'yellow', hint: 'It starts with y.' },
                { text: 'Write one word: A baby cat is a ...', answer: 'kitten', hint: 'It starts with k.' },
                { text: 'Complete the word: b_o_k', answer: 'book', hint: 'It is something you read.' },
                ...EXTRA_WRITING_SEEDS['eng2-write-1'],
            ];
        }

        if (level === 2) {
            return [
                { text: 'Write a short answer: "What is your name?"', answer: 'My name is An.', hint: 'Start with My name is ...' },
                { text: 'Write a short sentence about your favorite color.', answer: 'My favorite color is blue.', hint: 'Use: My favorite color is ...' },
                { text: 'Complete the sentence: "This is my ___." (school bag)', answer: 'bag', hint: 'One word only.' },
                ...EXTRA_WRITING_SEEDS['eng2-write-2'],
            ];
        }

        return [
            { text: 'Write one short sentence about your pet or favorite animal.', answer: 'I like cats.', hint: 'Use a short sentence.' },
            { text: 'Write one short sentence about your school.', answer: 'My school is nice.', hint: 'Use My school ...' },
            { text: 'Write one short sentence about your family.', answer: 'I love my family.', hint: 'Keep it short and simple.' },
            ...EXTRA_WRITING_SEEDS['eng2-write-3'],
        ];
    }

    if (level === 1) {
        return [
            { text: 'Write one sentence about your daily routine.', answer: "I get up at six o'clock.", hint: 'Use I + verb ...' },
            { text: 'Write one sentence about your house.', answer: 'My house has two bedrooms.', hint: 'Use My house ...' },
            { text: 'Write one sentence about your favorite food.', answer: 'I like noodles.', hint: 'Use I like ...' },
            ...EXTRA_WRITING_SEEDS['eng3-write-1'],
        ];
    }

    if (level === 2) {
        return [
            { text: 'Write two short sentences about what you do after school.', answer: 'I go home. I do my homework.', hint: 'Write 2 short sentences.' },
            { text: 'Write two short sentences about your family.', answer: 'My family is small. We are happy.', hint: 'Write 2 short sentences.' },
            { text: 'Write two short sentences about your room.', answer: 'My room is tidy. It has a desk.', hint: 'Write 2 short sentences.' },
            ...EXTRA_WRITING_SEEDS['eng3-write-2'],
        ];
    }

    return [
        { text: 'Write 2-3 short sentences about your weekend.', answer: 'I visit my grandparents. We eat lunch together.', hint: 'Keep the sentences short.' },
        { text: 'Write 2-3 short sentences about your favorite place.', answer: 'I like the park. It is green and quiet.', hint: 'Keep it simple.' },
        { text: 'Write 2-3 short sentences about how you save money.', answer: 'I save money in my piggy bank. I do not buy snacks every day.', hint: 'Write short ideas only.' },
        ...EXTRA_WRITING_SEEDS['eng3-write-3'],
    ];
}

export function generateEnglishListeningQuestion(skillId: string, level: number = 1): Question {
    const item = pickRandom(getListeningSeeds(skillId, getBalancedEnglishLevel(skillId, level)));
    return {
        id: `eng-list-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
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
        id: `eng-speak-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
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
        id: `eng-read-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
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
        id: `eng-write-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
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

export function generateEnglishCoreQuestion(skillId: string, level: number = 1): Question {
    const seeds = ENGLISH_CORE_SEEDS[skillId] || ENGLISH_CORE_SEEDS['eng-clothes'];
    const item = pickRandom(seeds);

    return {
        id: `eng-core-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
        subjectId: 'english',
        skillId,
        type: 'mcq',
        instruction: item.instruction,
        content: {
            text: item.text,
            options: item.options,
        },
        answer: item.answer,
        hint: item.hint,
        explanation: 'Choose the word or sentence that matches the grammar point or topic.',
    };
}

