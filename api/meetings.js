export default function handler(req, res) {
res.status(200).json([
{
id: '1',
time: '09:00',
title: 'Morgonplanering',
link: 'https://meet.google.com/',
},
{
id: '2',
time: '11:30',
title: 'Avstämning med Filip',
link: 'https://meet.google.com/',
},
{
id: '3',
time: '15:00',
title: 'Kundmöte',
link: 'https://meet.google.com/',
},
])
}
