import { writable } from 'svelte/store';

type Block = {
	id: string;
	content: string;
	relations: Relation[];
};

type Relation = {
	to: string;
	position: 'left' | 'right' | 'top' | 'down' | 'between' | 'indent';
	// mayybe add v_pos e h_pos
	// align: 'center';
};

type Diagram = {
	blocks: Block[];
};

export const diagram = writable<Diagram>({
	blocks: []
});

export const diagramSample: Diagram = {
	blocks: [
		{
			id: '0',
			content: 'Il primo conflitto punico scoppiò nel 264 a.C. in Sicilia.',
			relations: []
		},
		{
			id: '1',
			content: 'Lo provocò uno scontro fra',
			relations: [{ position: 'down', to: '0' }]
		},
		{
			id: '2',
			content: 'Gerone, tiranno di Siracusa',
			relations: [
				{
					position: 'down',
					to: '1'
				}
			]
		},
		{
			id: '3',
			content: ' e i Mamertini, un corpo di soldati mercenari campani',
			relations: [
				{
					position: 'down',
					to: '1'
				}
			]
		},
		{
			id: '4',
			content: 'che, dopo avere combattuto al servizio di Siracusa,',
			relations: [
				{
					position: 'down',
					to: '3'
				}
			]
		},
		{
			id: '5',
			content: 'occuparono la città e il territorio di Messina',
			relations: [
				{
					position: 'down',
					to: '4'
				}
			]
		},
		{
			id: '6',
			content: 'facendone una base per le loro scorrerie.',
			relations: [
				{
					position: 'down',
					to: '5'
				}
			]
		}
	]
};
