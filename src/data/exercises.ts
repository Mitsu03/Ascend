import { localized as l } from '@/i18n/types'
import type { Equipment, Exercise } from '@/types'

/** Catálogo local de exercícios. Sem dependências externas. */
export const EXERCISES: Exercise[] = [
  // ---------------------------------------------------------- Peso corporal
  {
    id: 'flexoes',
    name: l('Flexões', 'Push-ups'),
    muscleGroup: 'peito',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Corpo em linha reta, cotovelos a cerca de 45° do tronco, desce até o peito quase tocar o chão.',
      'Body in a straight line, elbows about 45° from the torso, lower until your chest nearly touches the floor.',
    ),
  },
  {
    id: 'flexoes-diamante',
    name: l('Flexões diamante', 'Diamond push-ups'),
    muscleGroup: 'bracos',
    equipment: 'nenhum',
    difficulty: 'intermedio',
    description: l(
      'Mãos juntas a formar um triângulo por baixo do peito. Foco no tríceps.',
      'Hands together forming a triangle under your chest. Triceps focused.',
    ),
  },
  {
    id: 'agachamento-corporal',
    name: l('Agachamento livre', 'Bodyweight squat'),
    muscleGroup: 'pernas',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Pés à largura dos ombros, desce como se te fosses sentar, joelhos alinhados com os pés.',
      'Feet shoulder-width apart, sit back as if into a chair, knees tracking over your toes.',
    ),
  },
  {
    id: 'afundos',
    name: l('Afundos', 'Lunges'),
    muscleGroup: 'pernas',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Passo à frente, desce até o joelho de trás quase tocar o chão. Alterna as pernas.',
      'Step forward and lower until the back knee almost touches the floor. Alternate legs.',
    ),
  },
  {
    id: 'agachamento-bulgaro',
    name: l('Agachamento búlgaro', 'Bulgarian split squat'),
    muscleGroup: 'pernas',
    equipment: 'nenhum',
    difficulty: 'intermedio',
    description: l(
      'Pé de trás apoiado num banco. Desce controlado, o peso fica na perna da frente.',
      'Rear foot on a bench. Lower under control, keeping the weight on the front leg.',
    ),
  },
  {
    id: 'ponte-gluteos',
    name: l('Ponte de glúteos', 'Glute bridge'),
    muscleGroup: 'pernas',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Deitado de costas, eleva a anca contraindo os glúteos no topo durante 1 segundo.',
      'Lying on your back, lift your hips and squeeze the glutes at the top for one second.',
    ),
  },
  {
    id: 'prancha',
    name: l('Prancha', 'Plank'),
    muscleGroup: 'core',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Antebraços no chão, corpo em linha reta, abdominal e glúteos contraídos.',
      'Forearms on the floor, body in a straight line, abs and glutes braced.',
    ),
  },
  {
    id: 'prancha-lateral',
    name: l('Prancha lateral', 'Side plank'),
    muscleGroup: 'core',
    equipment: 'nenhum',
    difficulty: 'intermedio',
    description: l(
      'Apoio num antebraço, anca elevada e alinhada. Alterna os lados.',
      'Supported on one forearm, hips lifted and in line. Alternate sides.',
    ),
  },
  {
    id: 'abdominais-bicicleta',
    name: l('Abdominais bicicleta', 'Bicycle crunches'),
    muscleGroup: 'core',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Cotovelo ao joelho oposto, movimento controlado sem puxar o pescoço.',
      'Elbow to opposite knee, controlled movement without pulling on your neck.',
    ),
  },
  {
    id: 'escalador',
    name: l('Escalador', 'Mountain climbers'),
    muscleGroup: 'cardio',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Em posição de prancha, traz os joelhos ao peito alternadamente em ritmo rápido.',
      'From a plank, drive your knees to your chest alternately at a quick pace.',
    ),
  },
  {
    id: 'burpees',
    name: l('Burpees', 'Burpees'),
    muscleGroup: 'corpo_inteiro',
    equipment: 'nenhum',
    difficulty: 'intermedio',
    description: l(
      'Agacha, prancha, flexão, salta. Mantém o ritmo constante em vez de acelerar e parar.',
      'Squat, plank, push-up, jump. Keep a steady rhythm rather than sprinting and stopping.',
    ),
  },
  {
    id: 'polichinelos',
    name: l('Polichinelos', 'Jumping jacks'),
    muscleGroup: 'cardio',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Salto com abertura de pernas e braços acima da cabeça. Aterragem suave.',
      'Jump your legs out while raising your arms overhead. Land softly.',
    ),
  },
  {
    id: 'corrida-lugar',
    name: l('Corrida no lugar', 'Running in place'),
    muscleGroup: 'cardio',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Joelhos altos, apoio na parte da frente do pé, braços a acompanhar.',
      'High knees, land on the balls of your feet, arms driving along.',
    ),
  },
  {
    id: 'superman',
    name: l('Superman', 'Superman'),
    muscleGroup: 'costas',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Deitado de barriga para baixo, eleva braços e pernas ao mesmo tempo.',
      'Lying face down, lift arms and legs at the same time.',
    ),
  },
  {
    id: 'dips-cadeira',
    name: l('Dips em cadeira', 'Chair dips'),
    muscleGroup: 'bracos',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Mãos numa cadeira estável atrás do corpo, desce dobrando os cotovelos para trás.',
      'Hands on a stable chair behind you, lower by bending the elbows backwards.',
    ),
  },
  {
    id: 'flexao-inclinada',
    name: l('Flexões inclinadas', 'Incline push-ups'),
    muscleGroup: 'peito',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Mãos apoiadas numa mesa ou parede. Versão mais acessível das flexões.',
      'Hands on a table or wall. An easier version of the push-up.',
    ),
  },
  {
    id: 'pike-push-up',
    name: l('Flexões em pique', 'Pike push-ups'),
    muscleGroup: 'ombros',
    equipment: 'nenhum',
    difficulty: 'intermedio',
    description: l(
      'Em V invertido, desce a cabeça em direção ao chão. Trabalha os deltoides.',
      'In an inverted V, lower your head towards the floor. Works the deltoids.',
    ),
  },
  {
    id: 'circulos-bracos',
    name: l('Círculos de braços', 'Arm circles'),
    muscleGroup: 'ombros',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Braços estendidos, círculos amplos e controlados à frente e atrás.',
      'Arms extended, wide controlled circles forwards and backwards.',
    ),
  },
  {
    id: 'remada-invertida',
    name: l('Remada invertida', 'Inverted row'),
    muscleGroup: 'costas',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Deitado sob uma mesa firme, puxa o peito em direção à borda.',
      'Lying under a sturdy table, pull your chest towards the edge.',
    ),
  },
  {
    id: 'agachamento-sumo',
    name: l('Agachamento sumo', 'Sumo squat'),
    muscleGroup: 'pernas',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Pés bem afastados e pontas viradas para fora. Foco em adutores e glúteos.',
      'Feet wide with toes turned out. Targets adductors and glutes.',
    ),
  },
  {
    id: 'elevacao-panturrilha',
    name: l('Elevação de gémeos', 'Calf raises'),
    muscleGroup: 'pernas',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Eleva os calcanhares até ao máximo e desce lentamente.',
      'Rise onto your toes as high as you can and lower slowly.',
    ),
  },

  {
    id: 'flexoes-declinadas',
    name: l('Flexões declinadas', 'Decline push-ups'),
    muscleGroup: 'peito',
    equipment: 'nenhum',
    difficulty: 'intermedio',
    description: l(
      'Pés apoiados num banco, mais altos do que as mãos. Carrega a parte alta do peito.',
      'Feet raised on a bench, higher than your hands. Loads the upper chest.',
    ),
  },
  {
    id: 'nordic-curl',
    name: l('Curl nórdico', 'Nordic hamstring curl'),
    muscleGroup: 'pernas',
    equipment: 'nenhum',
    difficulty: 'avancado',
    description: l(
      'De joelhos com os tornozelos presos, desce o tronco à frente o mais devagar que aguentares.',
      'Kneel with your ankles anchored and lower your torso forward as slowly as you can hold it.',
    ),
  },
  {
    id: 'coice-gluteo',
    name: l('Coice de glúteo', 'Glute kickback'),
    muscleGroup: 'pernas',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'De gatas, estende uma perna para trás e para cima sem arquear a lombar.',
      'On all fours, extend one leg back and up without arching your lower back.',
    ),
  },
  {
    id: 'pescoco-isometrico',
    name: l('Isometria de pescoço', 'Isometric neck hold'),
    muscleGroup: 'pescoco',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Mão na testa e depois na nuca: faz força contra a mão sem deixar a cabeça mexer-se.',
      'Hand on your forehead, then behind your head: press into it without letting the head move.',
    ),
  },
  {
    id: 'pescoco-lateral',
    name: l('Flexão lateral do pescoço', 'Lateral neck flexion'),
    muscleGroup: 'pescoco',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Mão sobre a orelha, empurra a cabeça para o lado contra a resistência da própria mão.',
      'Hand against the side of your head, press sideways into your own resistance.',
    ),
  },
  // ---------------------------------------------------------- Halteres
  {
    id: 'press-ombros-halteres',
    name: l('Press de ombros com halteres', 'Dumbbell shoulder press'),
    muscleGroup: 'ombros',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'Sentado ou de pé, empurra os halteres acima da cabeça sem arquear as costas.',
      'Seated or standing, press the dumbbells overhead without arching your back.',
    ),
  },
  {
    id: 'elevacoes-laterais',
    name: l('Elevações laterais', 'Lateral raises'),
    muscleGroup: 'ombros',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'Braços quase esticados, eleva até à altura dos ombros. Carga leve e controlo total.',
      'Arms nearly straight, raise to shoulder height. Light load, full control.',
    ),
  },
  {
    id: 'remada-unilateral',
    name: l('Remada unilateral', 'One-arm dumbbell row'),
    muscleGroup: 'costas',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'Apoio num banco, puxa o halter em direção à anca mantendo as costas neutras.',
      'Supported on a bench, pull the dumbbell towards your hip with a neutral spine.',
    ),
  },
  {
    id: 'curl-biceps',
    name: l('Curl de bíceps', 'Biceps curl'),
    muscleGroup: 'bracos',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'Cotovelos junto ao tronco, sobe sem balançar o corpo.',
      'Elbows tucked in, lift without swinging your body.',
    ),
  },
  {
    id: 'triceps-frances',
    name: l('Tríceps francês', 'Overhead triceps extension'),
    muscleGroup: 'bracos',
    equipment: 'halteres',
    difficulty: 'intermedio',
    description: l(
      'Halter acima da cabeça, desce atrás da nuca dobrando apenas os cotovelos.',
      'Dumbbell overhead, lower behind your head bending only at the elbows.',
    ),
  },
  {
    id: 'agachamento-goblet',
    name: l('Agachamento goblet', 'Goblet squat'),
    muscleGroup: 'pernas',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'Halter junto ao peito, desce mantendo o tronco erguido.',
      'Dumbbell held at your chest, squat down keeping your torso upright.',
    ),
  },
  {
    id: 'peso-morto-romeno-halteres',
    name: l('Peso morto romeno com halteres', 'Dumbbell Romanian deadlift'),
    muscleGroup: 'pernas',
    equipment: 'halteres',
    difficulty: 'intermedio',
    description: l(
      'Joelhos ligeiramente fletidos, empurra a anca para trás e sente o alongamento posterior.',
      'Knees softly bent, push your hips back and feel the stretch in your hamstrings.',
    ),
  },
  {
    id: 'press-peito-chao',
    name: l('Press de peito no chão', 'Floor press'),
    muscleGroup: 'peito',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'Deitado no chão, empurra os halteres para cima. Os cotovelos param ao tocar o solo.',
      'Lying on the floor, press the dumbbells up. Elbows stop when they touch the ground.',
    ),
  },
  {
    id: 'aberturas-halteres',
    name: l('Aberturas com halteres', 'Dumbbell flyes'),
    muscleGroup: 'peito',
    equipment: 'halteres',
    difficulty: 'intermedio',
    description: l(
      'Braços em arco amplo com ligeira flexão de cotovelo. Amplitude antes de carga.',
      'Wide arc with a slight elbow bend. Range of motion before load.',
    ),
  },
  {
    id: 'remada-alta-halteres',
    name: l('Remada alta', 'Upright row'),
    muscleGroup: 'ombros',
    equipment: 'halteres',
    difficulty: 'intermedio',
    description: l(
      'Puxa os halteres em direção ao queixo, cotovelos acima dos punhos.',
      'Pull the dumbbells towards your chin, elbows above your wrists.',
    ),
  },
  {
    id: 'afundos-halteres',
    name: l('Afundos com halteres', 'Dumbbell lunges'),
    muscleGroup: 'pernas',
    equipment: 'halteres',
    difficulty: 'intermedio',
    description: l(
      'Halteres ao lado do corpo, passada firme e tronco vertical.',
      'Dumbbells at your sides, firm stride and an upright torso.',
    ),
  },
  {
    id: 'encolhimentos',
    name: l('Encolhimentos de ombros', 'Shrugs'),
    muscleGroup: 'costas',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'Eleva os ombros na vertical e faz uma pausa curta no topo.',
      'Lift your shoulders straight up and pause briefly at the top.',
    ),
  },
  {
    id: 'russian-twist',
    name: l('Rotação russa', 'Russian twist'),
    muscleGroup: 'core',
    equipment: 'halteres',
    difficulty: 'intermedio',
    description: l(
      'Sentado com o tronco inclinado, roda o halter de lado a lado com controlo.',
      'Seated with your torso leaning back, rotate the weight side to side under control.',
    ),
  },

  {
    id: 'crucifixo-inverso',
    name: l('Crucifixo inverso', 'Reverse flyes'),
    muscleGroup: 'ombros',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'Tronco à frente, abre os braços em arco. O trabalho é da parte de trás do ombro, não do trapézio.',
      'Torso hinged forward, open your arms in an arc. The rear delt does the work, not the traps.',
    ),
  },
  {
    id: 'curl-martelo',
    name: l('Curl martelo', 'Hammer curls'),
    muscleGroup: 'bracos',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'Punhos neutros, como a agarrar um martelo. Apanha o braquial e o braquiorradial.',
      'Neutral wrists, as if holding a hammer. Hits the brachialis and brachioradialis.',
    ),
  },
  {
    id: 'curl-concentrado',
    name: l('Curl concentrado', 'Concentration curls'),
    muscleGroup: 'bracos',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'Sentado, cotovelo apoiado na coxa. Sobe até ao pico da contração e desce devagar.',
      'Seated, elbow braced on your thigh. Curl to the peak and lower slowly.',
    ),
  },
  {
    id: 'crunch-com-peso',
    name: l('Abdominais com peso', 'Weighted crunches'),
    muscleGroup: 'core',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'Peso ao peito, enrola a coluna sem puxar o pescoço. É o abdominal que faz o trabalho.',
      'Weight on your chest, curl the spine without pulling on your neck. The abs do the work.',
    ),
  },
  {
    id: 'curl-punho',
    name: l('Curl de punho', 'Wrist curl'),
    muscleGroup: 'antebracos',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'Antebraços apoiados, palmas para cima. Só o punho se mexe, em amplitude completa.',
      'Forearms braced, palms up. Only the wrist moves, through a full range.',
    ),
  },
  {
    id: 'curl-punho-inverso',
    name: l('Curl de punho inverso', 'Reverse wrist curl'),
    muscleGroup: 'antebracos',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'O mesmo com as palmas para baixo, para o lado de cima do antebraço.',
      'The same with palms down, for the top of the forearm.',
    ),
  },
  {
    id: 'flexao-pescoco',
    name: l('Flexão do pescoço', 'Neck curl'),
    muscleGroup: 'pescoco',
    equipment: 'halteres',
    difficulty: 'intermedio',
    description: l(
      'Deitado de costas num banco, disco leve na testa sobre uma toalha. Leva o queixo ao peito.',
      'Lying face up on a bench, a light plate on your forehead over a towel. Bring your chin to your chest.',
    ),
  },
  {
    id: 'extensao-pescoco',
    name: l('Extensão do pescoço', 'Neck extension'),
    muscleGroup: 'pescoco',
    equipment: 'halteres',
    difficulty: 'intermedio',
    description: l(
      'Deitado de barriga para baixo, disco leve na nuca sobre uma toalha. Levanta a cabeça devagar.',
      'Lying face down, a light plate on the back of your head over a towel. Raise your head slowly.',
    ),
  },
  {
    id: 'pinca-manual',
    name: l('Pinça de mão', 'Hand gripper'),
    muscleGroup: 'antebracos',
    equipment: 'halteres',
    difficulty: 'iniciante',
    description: l(
      'Fecha a pinça até tocar e segura um segundo. Acessório opcional, como na folha.',
      'Close the gripper until it touches and hold for a second. Optional accessory work, as on the sheet.',
    ),
  },
  {
    id: 'balde-arroz',
    name: l('Balde de arroz', 'Rice bucket training'),
    muscleGroup: 'antebracos',
    equipment: 'nenhum',
    difficulty: 'iniciante',
    description: l(
      'Mãos dentro do arroz a abrir, fechar e rodar até queimar. Acessório opcional, como na folha.',
      'Hands in the rice, opening, closing and rotating until it burns. Optional accessory work, as on the sheet.',
    ),
  },
  // ---------------------------------------------------------- Ginásio
  {
    id: 'supino',
    name: l('Press de peito com barra', 'Barbell bench press'),
    muscleGroup: 'peito',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Omoplatas retraídas, desce a barra ao meio do peito e empurra em linha.',
      'Shoulder blades retracted, lower the bar to mid-chest and press in a straight line.',
    ),
  },
  {
    id: 'supino-inclinado',
    name: l('Press de peito inclinado', 'Incline bench press'),
    muscleGroup: 'peito',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Banco a 30°, foco na porção superior do peitoral.',
      'Bench set to 30°, targeting the upper chest.',
    ),
  },
  {
    id: 'agachamento-barra',
    name: l('Agachamento com barra', 'Barbell back squat'),
    muscleGroup: 'pernas',
    equipment: 'ginasio',
    difficulty: 'avancado',
    description: l(
      'Barra apoiada nos trapézios, desce até pelo menos a paralela com o tronco firme.',
      'Bar resting on your traps, squat to at least parallel with a braced torso.',
    ),
  },
  {
    id: 'peso-morto',
    name: l('Peso morto', 'Deadlift'),
    muscleGroup: 'costas',
    equipment: 'ginasio',
    difficulty: 'avancado',
    description: l(
      'Barra junto às canelas, costas neutras, empurra o chão com os pés.',
      'Bar close to your shins, neutral back, push the floor away with your feet.',
    ),
  },
  {
    id: 'puxada-frente',
    name: l('Puxada à frente', 'Lat pulldown'),
    muscleGroup: 'costas',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'Puxa a barra até à parte superior do peito, cotovelos a descer junto ao corpo.',
      'Pull the bar to your upper chest, elbows driving down close to your body.',
    ),
  },
  {
    id: 'remada-sentada',
    name: l('Remada sentada', 'Seated cable row'),
    muscleGroup: 'costas',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'Tronco fixo, puxa o punho ao abdómen juntando as omoplatas.',
      'Torso still, pull the handle to your abdomen while squeezing your shoulder blades.',
    ),
  },
  {
    id: 'leg-press',
    name: l('Leg press', 'Leg press'),
    muscleGroup: 'pernas',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'Pés à largura dos ombros, desce até 90° sem descolar a lombar do apoio.',
      'Feet shoulder-width apart, lower to 90° without lifting your lower back off the pad.',
    ),
  },
  {
    id: 'extensao-pernas',
    name: l('Extensão de pernas', 'Leg extension'),
    muscleGroup: 'pernas',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'Estende os joelhos com pausa breve no topo e descida controlada.',
      'Extend your knees with a brief pause at the top and a controlled return.',
    ),
  },
  {
    id: 'curl-femoral',
    name: l('Curl femoral', 'Hamstring curl'),
    muscleGroup: 'pernas',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'Isola os isquiotibiais. Evita levantar a anca do apoio.',
      'Isolates the hamstrings. Keep your hips down on the pad.',
    ),
  },
  {
    id: 'press-militar',
    name: l('Press militar', 'Overhead press'),
    muscleGroup: 'ombros',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Barra à altura das clavículas, empurra na vertical com o core contraído.',
      'Bar at collarbone height, press straight up with a braced core.',
    ),
  },
  {
    id: 'triceps-polia',
    name: l('Extensão de tríceps na polia', 'Cable triceps pushdown'),
    muscleGroup: 'bracos',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'Cotovelos colados ao tronco, estende até à extensão completa.',
      'Elbows pinned to your sides, extend to full lockout.',
    ),
  },
  {
    id: 'curl-barra',
    name: l('Curl com barra', 'Barbell curl'),
    muscleGroup: 'bracos',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'Pega à largura dos ombros, sobe sem impulso da lombar.',
      'Shoulder-width grip, curl up without swinging from the lower back.',
    ),
  },
  {
    id: 'face-pull',
    name: l('Face pull', 'Face pull'),
    muscleGroup: 'ombros',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Puxa a corda em direção à testa com rotação externa dos ombros. Ótimo para postura.',
      'Pull the rope towards your forehead with external shoulder rotation. Great for posture.',
    ),
  },
  {
    id: 'elevacao-pernas-suspenso',
    name: l('Elevação de pernas na barra', 'Hanging leg raise'),
    muscleGroup: 'core',
    equipment: 'ginasio',
    difficulty: 'avancado',
    description: l(
      'Pendurado na barra, eleva as pernas sem balanço.',
      'Hanging from the bar, raise your legs without swinging.',
    ),
  },
  {
    id: 'passadeira-intervalos',
    name: l('Passadeira em intervalos', 'Treadmill intervals'),
    muscleGroup: 'cardio',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Alterna 1 min forte com 2 min moderado. Ajusta a velocidade ao teu nível.',
      'Alternate 1 min hard with 2 min moderate. Adjust the speed to your level.',
    ),
  },
  {
    id: 'remo-ergometro',
    name: l('Remo em ergómetro', 'Rowing machine'),
    muscleGroup: 'cardio',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Sequência pernas → tronco → braços na puxada e o inverso no regresso.',
      'Legs → torso → arms on the drive, and the reverse on the recovery.',
    ),
  },
  {
    id: 'bicicleta-estatica',
    name: l('Bicicleta estática', 'Stationary bike'),
    muscleGroup: 'cardio',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'Ritmo constante e confortável. Sela à altura da anca.',
      'Steady, comfortable pace. Saddle at hip height.',
    ),
  },
  {
    id: 'peck-deck',
    name: l('Peck deck', 'Pec deck'),
    muscleGroup: 'peito',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'Cotovelos à altura do peito, junta os braços à frente e segura um instante no fim.',
      'Elbows at chest height, bring the arms together in front and hold briefly at the end.',
    ),
  },
  {
    id: 'cruzamento-polia',
    name: l('Cruzamento na polia', 'Cable crossover'),
    muscleGroup: 'peito',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Um passo à frente das polias, cruza as mãos abaixo do peito. Tensão constante do início ao fim.',
      'A step in front of the pulleys, cross your hands below chest height. Constant tension throughout.',
    ),
  },
  {
    id: 'elevacoes',
    name: l('Elevações', 'Pull-ups'),
    muscleGroup: 'costas',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Pega pronada, um pouco mais larga que os ombros. Puxa até o queixo passar a barra.',
      'Overhand grip, slightly wider than your shoulders. Pull until your chin clears the bar.',
    ),
  },
  {
    id: 'elevacoes-supinadas',
    name: l('Elevações supinadas', 'Chin-ups'),
    muscleGroup: 'costas',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Pega supinada à largura dos ombros. A mesma puxada, com muito mais bíceps.',
      'Underhand grip at shoulder width. The same pull, with far more biceps.',
    ),
  },
  {
    id: 'remada-curvada',
    name: l('Remada curvada', 'Bent-over barbell row'),
    muscleGroup: 'costas',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Tronco a 45°, costas direitas. Puxa a barra ao umbigo e controla a descida.',
      'Torso at 45°, back flat. Pull the bar to your navel and control the way down.',
    ),
  },
  {
    id: 'elevacoes-laterais-polia',
    name: l('Elevações laterais na polia', 'Cable lateral raise'),
    muscleGroup: 'ombros',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'Polia baixa por trás do corpo. Sobe até à linha do ombro, sem encolher.',
      'Low pulley behind you. Raise to shoulder level without shrugging.',
    ),
  },
  {
    id: 'curl-scott',
    name: l('Curl Scott', 'Preacher curl'),
    muscleGroup: 'bracos',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'Braços apoiados no banco inclinado. Sem balanço nenhum: só o cotovelo dobra.',
      'Arms braced on the preacher bench. No swing at all: only the elbow bends.',
    ),
  },
  {
    id: 'curl-inverso',
    name: l('Curl inverso', 'Reverse curl'),
    muscleGroup: 'bracos',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'Pega pronada na barra. Trabalha o braquiorradial e o lado de cima do antebraço.',
      'Overhand grip on the bar. Works the brachioradialis and the top of the forearm.',
    ),
  },
  {
    id: 'rolo-punho',
    name: l('Rolo de punho', 'Wrist roller'),
    muscleGroup: 'antebracos',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Braços à frente, enrola a corda até acima e desenrola devagar. Queima como poucas coisas.',
      'Arms out in front, roll the cord all the way up and unroll it slowly. Few things burn like it.',
    ),
  },
  {
    id: 'crunch-polia',
    name: l('Crunch na polia', 'Cable crunch'),
    muscleGroup: 'core',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'De joelhos, corda atrás da cabeça. Enrola a coluna com a anca parada.',
      'Kneeling, rope behind your head. Curl the spine with your hips fixed.',
    ),
  },
  {
    id: 'hack-squat',
    name: l('Agachamento hack', 'Hack squat'),
    muscleGroup: 'pernas',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Costas apoiadas na máquina, pés a meio da plataforma. Desce até à paralela.',
      'Back against the machine, feet mid-platform. Descend to parallel.',
    ),
  },
  {
    id: 'peso-morto-pernas-esticadas',
    name: l('Peso morto de pernas esticadas', 'Stiff-legged deadlift'),
    muscleGroup: 'pernas',
    equipment: 'ginasio',
    difficulty: 'avancado',
    description: l(
      'Joelhos quase direitos, anca para trás. Desce até sentires o isquiotibial, não mais.',
      'Knees nearly straight, hips back. Lower until the hamstrings stretch, no further.',
    ),
  },
  {
    id: 'bom-dia',
    name: l('Bom-dia', 'Good morning'),
    muscleGroup: 'pernas',
    equipment: 'ginasio',
    difficulty: 'avancado',
    description: l(
      'Barra nas costas, dobra pela anca com a lombar firme. Carga leve e técnica primeiro.',
      'Bar on your back, hinge at the hips with a solid lower back. Light load and technique first.',
    ),
  },
  {
    id: 'hip-thrust',
    name: l('Elevação de anca com barra', 'Barbell hip thrust'),
    muscleGroup: 'pernas',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Costas no banco, barra sobre a anca. Sobe até ao alinhamento e aperta os glúteos no topo.',
      'Upper back on the bench, bar over your hips. Drive up to a straight line and squeeze at the top.',
    ),
  },
  {
    id: 'coice-gluteo-polia',
    name: l('Coice de glúteo na polia', 'Cable glute kickback'),
    muscleGroup: 'pernas',
    equipment: 'ginasio',
    difficulty: 'intermedio',
    description: l(
      'Tornozeleira na polia baixa. Leva a perna atrás sem rodar a anca.',
      'Ankle strap on the low pulley. Drive the leg back without rotating the hip.',
    ),
  },
  {
    id: 'gemeos-sentado',
    name: l('Elevação de gémeos sentado', 'Seated calf raise'),
    muscleGroup: 'pernas',
    equipment: 'ginasio',
    difficulty: 'iniciante',
    description: l(
      'Joelhos dobrados a 90°, o que põe o sóleo a trabalhar. Amplitude completa e pausa em baixo.',
      'Knees bent to 90°, which puts the soleus to work. Full range with a pause at the bottom.',
    ),
  },
]

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((exercise) => [exercise.id, exercise]),
)

export function getExercise(id: string): Exercise | undefined {
  return EXERCISE_BY_ID[id]
}

/** Ordem de inclusão: 'ginasio' abrange tudo, 'halteres' abrange peso corporal. */
export const EQUIPMENT_RANK: Record<Equipment, number> = {
  nenhum: 0,
  halteres: 1,
  ginasio: 2,
}
