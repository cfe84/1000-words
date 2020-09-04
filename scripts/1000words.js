function stem(word)
{
	var stemmed = stemmer(word);
	return stemmed;
}

// Returns an ordered list of elements, returning elements 
// grouped depending on the characterSet: if consecutive characters are
// part of characterSet they'll be grouped.
function split(parsetext, characterSet)
{
	parsetext += " ";
	var cursor = 0;
	var result = [];
	var currentlyInSet = characterSet.indexOf(parsetext[0]) != -1;
	for(i = 0; i < parsetext.length; i++)
	{
		var isInSet = characterSet.indexOf(parsetext[i]) != -1;
		if (isInSet != currentlyInSet || i == parsetext.length - 1) // Push to result
		{
			var word = {
				type: currentlyInSet ? "word" : "separator",
				text: parsetext.substr(cursor, i - cursor),
				ranking: 0
			};
			result.push(word);
			currentlyInSet = isInSet;
			cursor = i;
		}
	}
	return result;
}

// This returns an ordered list of typed elements from a text
// each object contains two things:
// - type: either word or separator
// - text: corresponding text.
function parse(text)
{
	return split(text, "acbdefghijklmnopqprstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
}

function wordAnalyzer()
{
	var reference = getStemmedWords();
	return (function(word) {
		var stemmed = stemmer(word.toLowerCase());
		var rank = reference.indexOf(stemmed);
		return rank;
	});
}

function formatWords(words)
{
	return words
		.map(function(word) {
			return word.type != "word" ? word.text
				: word.ranking < 0 ? "<span class='out'>" + word.text + "</span>"
				: word.ranking < 1000 ? "<span style='color: #00" + Math.ceil((1000-word.ranking) * 255 / 1000).toString(16) + "00'>" + word.text + "</span>"
				: "<span style='color: #" + Math.ceil((5000-word.ranking) * 255 / 5000).toString(16) + "8800'>" + word.text + "</span>"
		})
		.join("");
}

// Get metrics for the list of words that have been ranked.
function getMetrics(words)
{
	var _totalIn1000 = words.reduce(function(previousValue, currentValue){
		return previousValue + 
			(currentValue.type != "word" ? 0 
			: currentValue.ranking >= 0 && currentValue.ranking < 1000 ? 1
			: 0);
	}, 0);	
	var _totalIn5000 = words.reduce(function(previousValue, currentValue){
		return previousValue + 
			(currentValue.type != "word" ? 0 
			: currentValue.ranking >= 0 ? 1
			: 0);
	}, 0);
	var _totalWords = words.reduce(function(previousValue, currentValue){
		return previousValue + 
			(currentValue.type != "word" ? 0 
			: 1);
	}, 0);
	var _totalRanking = words.reduce(function(previousValue, currentValue){
		return previousValue + 
			(currentValue.type == "word" ? currentValue.ranking 
			: 0);
	}, 0);
	return {
		totalGroups: words.length,
		totalWords: _totalWords,
		averageRanking: _totalRanking / _totalWords,
		in1000ratio: _totalIn1000 / _totalWords,
		in5000ratio: _totalIn5000 / _totalWords,
	};
}

function process(text)
{
	var analyzer = wordAnalyzer();
	var test = analyzer("they");
	var words = parse(text);
	words
		.forEach(function(value){
				if (value.type == "word")
					value.ranking = analyzer(value.text);
			});
	return {
		formattedText: formatWords(words),
		metrics: getMetrics(words)
	};
}

$(function()
{
	$("#words--vet").on("click", function()
	{
		var text = $("#words--input").val();
		var result = process(text);
		$("#words--stats--words").text(result.metrics.totalWords);
		$("#words--stats--average").text((result.metrics.averageRanking).toFixed(2));
		$("#words--stats--ratio1000").text((result.metrics.in1000ratio * 100).toFixed(2));
		$("#words--stats--ratio5000").text((result.metrics.in5000ratio * 100).toFixed(2));
		$("#words--result").html(result.formattedText); 
	});
});